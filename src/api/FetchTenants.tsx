// src/api/FetchTenants.ts

export const fetchTenantsForUser = async (userId: string) => {
  console.log("USER TRYING TO LOG IN: ", userId);

  try {
    const userResponse = await fetch(
      `/api/facts/${process.env.NEXT_PUBLIC_PROJ_ID}/${process.env.NEXT_PUBLIC_ENV_ID}/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PERMIT_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user details");
    }

    const userData = await userResponse.json();
    console.log("Fetched user data:", userData);

    if (
      !userData ||
      !userData.associated_tenants ||
      !Array.isArray(userData.associated_tenants)
    ) {
      console.error("User data is not in the expected format", userData);
      return [];
    }

    const tenantIds = userData.associated_tenants.map(
      (tenant: any) => tenant.tenant,
    );
    console.log("Tenant IDs for the user:", tenantIds);

    const tenantsResponse = await fetch(
      `/api/facts/${process.env.NEXT_PUBLIC_PROJ_ID}/${process.env.NEXT_PUBLIC_ENV_ID}/tenants`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PERMIT_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!tenantsResponse.ok) {
      throw new Error("Failed to fetch tenants");
    }

    const tenantsData = await tenantsResponse.json();
    console.log("Fetched tenants data:", tenantsData);

    const filteredTenants = tenantsData.filter((tenant: any) =>
      tenantIds.includes(tenant.key),
    );
    console.log("Filtered tenants:", filteredTenants);

    return filteredTenants;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return [];
  }
};

export const fetchAllUsers = async () => {
  try {
    const usersResponse = await fetch(
      `/api/facts/${process.env.NEXT_PUBLIC_PROJ_ID}/${process.env.NEXT_PUBLIC_ENV_ID}/users`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PERMIT_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!usersResponse.ok) {
      throw new Error("Failed to fetch all users");
    }

    const usersData = await usersResponse.json();
    console.log("Fetched all users data:", usersData);

    return usersData; // Ensure this returns an array of users
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
