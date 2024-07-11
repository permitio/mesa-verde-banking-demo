import permit from "@/lib/authorizer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = request.headers.get("x-user-key") || "";
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get("account") || "";

  const allowed = await permit.check(user, "read", { type: "Account", tenant });
  if (!allowed) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 403,
      },
    );
  }

  return NextResponse.json([
    {
      balance: Math.floor(Math.random() * 1000000) / 100,
      currency: "$",
    },
  ]);
}
