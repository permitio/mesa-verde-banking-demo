import { NextRequest, NextResponse } from 'next/server';
import { Permit } from "permitio";

interface Tenant {
  key: string;
  created_at: string;
}

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PERMIT_PDP_HOSTNAME,
});

// Function to deeply merge two objects
function mergeDeep(target: any, source: any) {
  const isObject = (obj: any) => obj && typeof obj === 'object';
  
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = Array.from(new Set([...targetValue, ...sourceValue]));
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep({ ...targetValue }, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  console.log("URL PARAMETERS: ", searchParams);

  const userIdKey = searchParams.get('id');
  const userEmailKey = searchParams.get('email');

  if (!userIdKey || !userEmailKey) {
    return NextResponse.json({ error: 'User ID and Email are required' }, { status: 400 });
  }

  try {
    // Fetch user data by userIdKey
    const userDataById = await permit.api.users.getByKey(userIdKey);
    console.log("USER DATA BY ID: ", userDataById);

    // Fetch user data by userEmailKey
    let userDataByEmail;
    try {
      userDataByEmail = await permit.api.users.getByKey(userEmailKey);
      console.log("USER DATA BY EMAIL: ", userDataByEmail);
    } catch (emailError) {
      console.warn("Error fetching user data by email, proceeding with ID data only:", emailError);
      userDataByEmail = null;
    }

    // Merge user data only if userDataByEmail is not null
    const combinedUserData = userDataByEmail ? mergeDeep(userDataById, userDataByEmail) : userDataById;

    console.log("COMBINED USER DATA: ", combinedUserData);

    if (!combinedUserData || !combinedUserData.associated_tenants) {
      console.error("User data is not in the expected format or no associated tenants", combinedUserData);
      return NextResponse.json([], { status: 200 });
    }

    const tenantsData: Tenant[] = await permit.api.tenants.list();

    const sortTenantsByDate = (tenants: Tenant[]) => {
      return tenants.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    };

    let filteredTenants: Tenant[];
    
    const tenantIds = combinedUserData.associated_tenants.map((tenant: any) => tenant.tenant);
    filteredTenants = tenantsData.filter(tenant => tenantIds.includes(tenant.key));
    filteredTenants = sortTenantsByDate(filteredTenants);

    return NextResponse.json(filteredTenants, { status: 200 });
  } catch (error) {
    console.error("Error fetching user or tenants:", error);
    return NextResponse.json({ error: 'Failed to fetch user or tenants' }, { status: 500 });
  }
}
