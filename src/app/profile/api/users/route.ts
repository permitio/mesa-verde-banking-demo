import { NextRequest, NextResponse } from 'next/server';
import { Permit } from "permitio";

const permit = new Permit({
  token: process.env.NEXT_PUBLIC_PERMIT_API_KEY,
  pdp: "http://localhost:7766",
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
