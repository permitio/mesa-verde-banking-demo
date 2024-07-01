import { NextRequest, NextResponse } from 'next/server';
import { Permit } from 'permitio';

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PERMIT_PDP_HOSTNAME,
});

export async function POST(request: NextRequest) {
  const { userId, userEmail } = await request.json();

  console.log("SERVER USER DATA: ", userId, userEmail)

  const cleanedEmail = userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

  try {
    // Create Tenant
    const createTenantResponse = await permit.api.tenants.create({
      key: cleanedEmail,
      name: userEmail,
    });

    console.log("Create Tenant Response: ", createTenantResponse);

    // Add User to Tenant
    const addUserToTenantResponse = await permit.api.syncUser({
      key: userId,
      email: userEmail,
    });

    // Assign Role
    const assignRoleResponse = await permit.api.assignRole({
      role: 'AccountOwner',
      tenant: cleanedEmail,
      user: userId,
    });

    // Mock Data
    const mockData = {
      [cleanedEmail]: {
        balance: '0',
        transactions: [],
      },
    };

    return NextResponse.json({ mockData, createTenantResponse, addUserToTenantResponse, assignRoleResponse }, { status: 200 });
  } catch (error) {
    console.error('Error in route.js:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
