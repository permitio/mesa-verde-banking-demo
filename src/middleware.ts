import { NextRequest, NextResponse } from "next/server";
import loadStytch from "@/lib/stytch";
import { Client } from "stytch";

const authenticationError = (message: string) => {
  return Response.json({ success: false, message }, { status: 401 });
};

const ip = (headers: Headers) => {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers.get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
};

const geolocation = async (ip: string) => {
  const response = await fetch(
    `https://ipinfo.io/${ip}/country`,
  );

  return response.text();
};

export async function middleware(req: NextRequest) {
  const jwt = req.cookies.get("stytch_session_jwt");

  if (!jwt) {
    return authenticationError(
      "Authentication failed - No Authentication Cookie",
    );
  }

  const stytchClient: Client = loadStytch();

  try {
    const {
      user: { emails, user_id },
    } = await stytchClient.sessions.authenticate({
      session_jwt: jwt.value,
    });
    const location = await geolocation(ip(req.headers));
    req.headers.set("x-user-key", emails[0].email);
    req.headers.set("x-user-id", user_id);
    req.headers.set("x-user-email-id", emails[0].email_id);
    req.headers.set("x-user-location", location);
    return NextResponse.next({
      request: req,
    });
  } catch (error) {
    return authenticationError(
      "Authentication failed - Invalid Authentication Cookie",
    );
  }
}

export const config = {
  matcher: "/account/api/:path*",
};
