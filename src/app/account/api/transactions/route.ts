import { TransferRequest } from "@/lib/Model";
import permit from "@/lib/authorizer";
import { NextRequest, NextResponse } from "next/server";

const unauthorizedResponse = () => {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 403,
    },
  );
};

function generateRandomArray(): any[] {
  const randomArray = [];
  const length = Math.floor(Math.random() * 10) + 1;
  for (let i = 0; i < length; i++) {
    const randomId = Math.floor(Math.random() * 1000);
    const randomDate = new Date().toISOString().split("T")[0];
    const transactionTypes = [
      "Deposit",
      "Withdrawal",
      "Transfer",
      "Payment",
      "Purchase",
      "Refund",
      "Interest",
      "Fee",
      "Salary",
      "Bonus",
    ];
    const randomDescription =
      transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const randomAmount =
      Math.random() < 0.5
        ? "-£" + (Math.random() * 100).toFixed(2)
        : "+£" + (Math.random() * 100).toFixed(2);
    randomArray.push({
      id: randomId,
      date: randomDate,
      description: randomDescription,
      amount: randomAmount,
    });
  }
  return randomArray;
}

export async function POST(request: NextRequest) {
  const user = request.headers.get("x-user-key") || "";
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get("tenant") || "";
  const { to, transaction } = (await request.json()) as TransferRequest;

  const allowed = await permit.check(user, "create", {
    type: "Wire_Transfer",
    attributes: { ...transaction },
    tenant,
  });

  if (!allowed) {
    await permit.api.resourceInstances.create({
      resource: "Wire_Transfer",
      key: transaction.id,
      tenant,
      attributes: {
        ...transaction,
      },
    });
    const tenantUsers = await permit.api.tenants.listTenantUsers({
      tenantKey: tenant,
    });
    const tenantOwner = tenantUsers.data.find((user) =>
      user.associated_tenants?.find(
        ({ tenant, roles }) =>
          tenant === tenant && roles.includes("AccountOwner"),
      ),
    );
    const wireTransferResource = await permit.api.resources.getByKey("Wire_Transfer");
    const resourceRoles = wireTransferResource?.roles as any;
    const approvedRole: string = resourceRoles?.["_Reviewer_"]?.id
    await permit.api.roleAssignments.assign({
      role: approvedRole,
      tenant: tenant,
      resource_instance: `Wire_Transfer:${transaction.id}`,
      user: tenantOwner?.key || "",
    });
    return NextResponse.json(
      {
        message: "Wire transfer needs approval",
        transfer: transaction.id,
      },
      {
        status: 403,
      },
    );
  }

  const resourceInstance = await permit.api.resourceInstances.create({
    resource: "Transaction",
    key: transaction.id,
    tenant,
    attributes: {
      ...transaction,
    },
  });

  return NextResponse.json({
    ...resourceInstance,
  });
}

export async function GET(request: NextRequest) {
  const user = request.headers.get("x-user-key") || "";
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get("account") || "";

  const allowed = await permit.check(user, "list", {
    type: "Transaction",
    tenant,
  });
  if (!allowed) {
    return unauthorizedResponse();
  }

  return NextResponse.json(generateRandomArray());
}
