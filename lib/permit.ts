import { ActionResourceSchema } from "permit-fe-sdk";
import { Permit, UserRead } from "permitio";
import { Transaction } from "./Model";

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PDP_URL,
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

export const getTenantOwner = async (
  tenant: string,
): Promise<UserRead | undefined> => {
  const tenantUsers = await permit.api.tenants.listTenantUsers({
    tenantKey: tenant,
  });
  const tenantOwner = tenantUsers.data.find((user) =>
    user.associated_tenants?.find(
      ({ tenant, roles }) =>
        tenant === tenant && roles.includes("AccountOwner"),
    ),
  );
  return tenantOwner;
};

export const createWireApprovalFlow = async (
  transaction: Transaction,
  tenant: string,
  tenantOwner: UserRead | undefined,
) => {
  await permit.api.resourceInstances.create({
    resource: "Wire_Transfer",
    key: transaction.id,
    tenant,
    attributes: {
      ...transaction,
    },
  });
  await permit.api.roleAssignments.assign({
    role: "_Reviewer_",
    tenant: tenant,
    resource_instance: `Wire_Transfer:${transaction.id}`,
    user: tenantOwner?.key || "",
  });
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
  await permit.api.assignRole({
    role: "AccountOwner",
    tenant: cleanedEmail,
    user: email,
  });

  return addUserToTenantResponse;
};

export const synchronizeLocation = async () => {
  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_KEY}/latest`,
    );
    const data = await response.json();

    const envUsers = await permit.api.users.list();
    const users = envUsers.data.map((user) => user.key);

    await Promise.all(
      Object.entries(data.record)
        .filter(([key]) => users.includes(key))
        .map(([key, country]) =>
          permit.api.users.update(key, { attributes: { country } }),
        ),
    );
  } catch (error) {
    console.error("Error fetching location data", error);
  }
};

export const createTransactionResource = async (
  transaction: Transaction,
  tenant: string,
  user: string,
  to?: string,
) => {
  const resourceInstance = await permit.api.resourceInstances.create({
    resource: "Transaction",
    key: transaction.id,
    tenant,
    attributes: {
      ...transaction,
    },
  });

  await permit.api.roleAssignments.assign({
    role: "Sender",
    tenant,
    resource_instance: `Transaction:${transaction.id}`,
    user,
  });

  const receiverUser = await getTenantOwner(to || transaction.to || "");

  await permit.api.roleAssignments.assign({
    role: "Receiver",
    tenant,
    resource_instance: `Transaction:${transaction.id}`,
    user: receiverUser?.key || "",
  });
  return resourceInstance;
};

export default permit;
