import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    const authorizationHeader = request.headers.get("Authorization") || "";
    const data = await request.json();

    console.log("Webhook request", request);

    const secret = authorizationHeader.split(" ")[1];

    if (secret !== process.env.WEBHOOK_SECRET) {
        return NextResponse.json("Unauthorized", { status: 401 });
    }

    console.log("Webhook data", data);
    return NextResponse.json("OK");
};
