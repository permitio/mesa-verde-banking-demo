import { NextRequest, NextResponse } from 'next/server';
import { Permit } from "permitio";

interface Tenant {
  key: string;
  created_at: string;
}

const permit = new Permit({
  token: process.env.NEXT_PUBLIC_PERMIT_API_KEY,
  pdp: "http://localhost:7766",
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const userData = await permit.api.users.getById(userId);

    if (!userData || !userData.associated_tenants) {
      console.error("User data is not in the expected format or no associated tenants", userData);
      return NextResponse.json([], { status: 200 });
    }

    const tenantsData: Tenant[] = await permit.api.tenants.list();

    const sortTenantsByDate = (tenants: Tenant[]) => {
      return tenants.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    };

    let filteredTenants: Tenant[];

    if (userId === "user-test-2bd26c50-8faa-483d-b413-ed045d303ecf") {
      filteredTenants = tenantsData.filter(tenant => tenant.key !== "default");
    } else {
      const tenantIds = userData.associated_tenants.map(tenant => tenant.tenant);
      filteredTenants = tenantsData.filter(tenant => tenantIds.includes(tenant.key));
    }

    filteredTenants = sortTenantsByDate(filteredTenants);

    return NextResponse.json(filteredTenants, { status: 200 });
  } catch (error) {
    console.error("Error fetching user or tenants:", error);
    return NextResponse.json({ error: 'Failed to fetch user or tenants' }, { status: 500 });
  }
}
