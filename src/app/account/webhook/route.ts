import { Transaction } from "@/lib/Model";
import permit, {
  createTransactionResource,
  getTenantOwner,
} from "@/lib/permit";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const authorizationHeader = request.headers.get("Authorization") || "";
  const data = await request.json();

  console.log("Webhook request", request);

  const secret = authorizationHeader.split(" ")[1];
  console.log("Webhook secret", secret);
  console.log("Webhook env secret", process.env.WEBHOOK_SECRET);
  console.log("Webhook data", authorizationHeader);
  console.log("Webhook headers", request.headers);

  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  console.log("Webhook data", data);

  const {
    status,
    reviewer_user_id,
    requesting_user_id,
    operation_approval_details: {
      tenant: senderTenant,
      resource_instance: wireTransferInstance,
    },
  } = data;

  if (status !== "approved") {
    await permit.api.resourceInstances.delete(wireTransferInstance);
    return NextResponse.json("OK");
  }

  const { attributes: transaction } =
    await permit.api.resourceInstances.getById(wireTransferInstance);

  const { email: approver } = await permit.api.users.getById(reviewer_user_id);
  const { email: requester } =
    await permit.api.users.getById(requesting_user_id);

  await createTransactionResource(
    {
      ...(transaction as Transaction),
      description: `${(transaction as Transaction).description} | Made by: ${requester} | Approved by: ${approver}`,
    },
    senderTenant,
    reviewer_user_id,
  );

  return NextResponse.json("OK");
};
