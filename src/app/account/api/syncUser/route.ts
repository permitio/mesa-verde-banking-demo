import permit from '@/lib/authorizer';
import { NextRequest, NextResponse } from 'next/server';
import { PermitApiError, TenantRead } from 'permitio';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
    }

    const cleanedEmail = userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

    // Create Tenant
    let createTenantResponse;
    try {
      createTenantResponse = await permit.api.tenants.create({
        key: cleanedEmail,
        name: userEmail,
      });
    } catch (error: Error | any) {
      if (error?.response?.status === 409) {
        console.warn('Tenant already exists, skipping creation:', cleanedEmail);
      } else {
        console.error('Error creating tenant:', error);
        return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
      }
    }

    // Add User to Tenant
    let addUserToTenantResponse;
    try {
      addUserToTenantResponse = await permit.api.syncUser({
        key: userId,
        email: userEmail,
      });
    } catch (error) {
      console.error('Error adding user to tenant:', error);
      return NextResponse.json({ error: 'Failed to add user to tenant' }, { status: 500 });
    }

    // Assign Role
    let assignRoleResponse;
    try {
      assignRoleResponse = await permit.api.assignRole({
        role: 'AccountOwner',
        tenant: cleanedEmail,
        user: userId,
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 });
    }

    // Mock Data
    const mockData = {
      [cleanedEmail]: {
        balance: '0',
        transactions: [],
      },
    };

    return NextResponse.json({
      mockData,
      createTenantResponse,
      addUserToTenantResponse,
      assignRoleResponse,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in route.js:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
