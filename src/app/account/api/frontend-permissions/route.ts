import { authorizeBulkFrontend } from "@/lib/permit";
import { NextRequest, NextResponse } from "next/server";
import { ActionResourceSchema } from "permit-fe-sdk";

type PermitCheckSchema = {
  resourcesAndActions: ActionResourceSchema[];
};

export async function POST(request: NextRequest) {
  try {
    const { resourcesAndActions } = (await request.json()) as PermitCheckSchema;
    const userId = request.headers.get("x-user-key") || "";
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get("tenant") || "";

    const permittedList = await authorizeBulkFrontend(
      userId,
      tenant,
      resourcesAndActions,
    );

    return NextResponse.json(
      { permittedList },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
      },
    );
  }
}
