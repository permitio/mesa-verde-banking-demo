import { ActionResourceSchema } from "permit-fe-sdk";
import { Permit, UserRead } from "permitio";

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PERMIT_PDP_HOSTNAME,
});

export const elementsLogin = async (userId: string, tenantId: string) => {
  const ticket = await permit.elements.loginAs({ userId, tenantId });
  return ticket;
};

export const authorizeBulkFrontend = async (
  userId: string,
  tenant: string,
  resourcesAndActions: ActionResourceSchema[],
): Promise<boolean[]> => {
  return await permit.bulkCheck(
    resourcesAndActions.map(
      ({ resource, action, userAttributes, resourceAttributes }) => ({
        user: { key: userId, attributes: userAttributes },
        action,
        resource: { type: resource, attributes: resourceAttributes, tenant },
      }),
    ),
  );
};

export const getUser = async (key: string): Promise<UserRead | null> => {
  // Fetch user data by userIdKey
  try {
    const user = await permit.api.users.getByKey(key);
    return user;
  } catch (error) {
    console.warn("Error fetching user data by ID", error);
    return null;
  }
};

export const syncUser = async (email: string): Promise<UserRead | null> => {
  const cleanedEmail = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");

  // Create Tenant
  let createTenantResponse;
  try {
    createTenantResponse = await permit.api.tenants.create({
      key: cleanedEmail,
      name: email,
    });
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.debug("Tenant already exists, skipping creation:", cleanedEmail);
    } else {
      throw error;
    }
  }

  // Add User to Tenant
  const addUserToTenantResponse = await permit.api.syncUser({
    key: email,
    email,
  });

  // Assign Role
  const assignRoleResponse = await permit.api.assignRole({
    role: "AccountOwner",
    tenant: cleanedEmail,
    user: email,
  });

  return addUserToTenantResponse;
};

export default permit;
