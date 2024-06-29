import { NextRequest, NextResponse } from 'next/server';
import { Permit } from 'permitio';

const permit = new Permit({
  token: process.env.NEXT_PUBLIC_PERMIT_API_KEY,
  pdp: 'http://localhost:7766',
});

export async function POST(request: NextRequest) {
  const { userId, userEmail } = await request.json();

  console.log("SERVER USER DATA: ", userId, userEmail)

  const numbers = userEmail.match(/\+(\d+)/);
  const extractedNumbers = numbers ? numbers[1] : '';

  console.log(numbers, extractedNumbers);

  try {
    // Create Tenant
    const createTenantResponse = await permit.api.tenants.create({
      key: `current-account-${extractedNumbers}`,
      name: `Current Account ${extractedNumbers}`,
    });

    // Add User to Tenant
    const addUserToTenantResponse = await permit.api.syncUser({
      key: userId,
      email: userEmail,
    });

    // Assign Role
    const assignRoleResponse = await permit.api.assignRole({
      role: 'AccountOwner',
      tenant: `current-account-${extractedNumbers}`,
      user: userId,
    });

    // Mock Data
    const mockData = {
      [`current-account-${extractedNumbers}`]: {
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
