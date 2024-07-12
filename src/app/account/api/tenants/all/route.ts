import permit from "@/lib/authorizer";
import { NextResponse } from "next/server";

export async function GET() {
  const tenants = await permit.api.tenants.list({
    perPage: 100,
  });
  return NextResponse.json(tenants);
}
