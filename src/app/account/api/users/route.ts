import permit from "@/lib/permit";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await permit.api.listUsers();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users through SDK:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
