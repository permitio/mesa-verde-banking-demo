import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import permit, { getUser, synchronizeLocation, syncUser } from "@/lib/permit";

interface Tenant {
  key: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const reqHeaders = headers();
  const userKey = reqHeaders.get("x-user-key") || "";

  try {
    let userData = await getUser(userKey);

    if (!userData) {
      await syncUser(userKey);
      userData = await getUser(userKey);
    }

    await synchronizeLocation();

    const ownedTenant = userData?.associated_tenants?.find((tenant: any) =>
      tenant.roles.includes("AccountOwner"),
    );

    if (!userData || !userData.associated_tenants) {
      console.error(
        "User data is not in the expected format or no associated tenants",
        userData,
      );
      return NextResponse.json([], { status: 200 });
    }

    const tenantsData: Tenant[] = await permit.api.tenants.list();

    let filteredTenants: Tenant[];

    const tenantIds = userData.associated_tenants
      .filter(
        (tenant: any) =>
          tenant.roles.includes("AccountBeneficiary") ||
          tenant.roles.includes("AccountOwner") ||
          tenant.roles.includes("AccountMember"),
      )
      .map((tenant: any) => tenant.tenant);
    filteredTenants = tenantsData
      .filter((t) => tenantIds.includes(t.key))
      .sort((t) => (t.key === ownedTenant?.tenant ? -1 : 1));

    return NextResponse.json(filteredTenants, { status: 200 });
  } catch (error) {
    console.error("Error fetching user or tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch user or tenants" },
      { status: 500 },
    );
  }
}
