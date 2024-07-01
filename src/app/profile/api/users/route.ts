import { NextRequest, NextResponse } from 'next/server';
import { Permit } from "permitio";

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
  pdp: process.env.PERMIT_PDP_HOSTNAME,
});

export async function GET(request: NextRequest) {
  try {
    const users = await permit.api.listUsers();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users through SDK:", error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
