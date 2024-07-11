import { NextRequest, NextResponse } from "next/server";
import loadStytch from "@/lib/loadStytch";

const authenticationError = (message: string) => {
  return Response.json({ success: false, message }, { status: 401 });
};

export async function middleware(req: NextRequest) {
  const jwt = req.cookies.get("stytch_session_jwt");

  if (!jwt) {
    return authenticationError(
      "Authentication failed - No Authentication Cookie",
    );
  }

  const stytchClient = loadStytch();

  try {
    const {
      user: { emails },
    } = await stytchClient.sessions.authenticate({
      session_jwt: jwt.value,
    });
    req.headers.set("x-user-key", emails[0].email);
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
