import { elementsLogin } from "@/lib/authorizer";
import { redirect, useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-key") || "";
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get("tenant") || "";

  const credentials = await elementsLogin(userId, tenant);

  return redirect(credentials.redirect_url)
}
