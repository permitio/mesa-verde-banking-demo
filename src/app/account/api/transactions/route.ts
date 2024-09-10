import { Transaction, TransferRequest } from "@/lib/Model";
import permit, {
  createTransactionResource,
  createWireApprovalFlow,
  getTenantOwner,
} from "@/lib/permit";
import loadStytch, { auhtenticateOTP } from "@/lib/stytch";
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

const generateRandomTransaction = () => {
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
  return {
    id: randomId,
    date: randomDate,
    description: randomDescription,
    amount: randomAmount,
  };
};

function generateRandomArray(): any[] {
  const randomArray = [];
  const length = Math.floor(Math.random() * 10) + 1;
  for (let i = 0; i < length; i++) {
    randomArray.push(generateRandomTransaction());
  }
  return randomArray;
}

export async function POST(request: NextRequest) {
  const user = request.headers.get("x-user-key") || "";
  const email_id = request.headers.get("x-user-email-id") || "";
  const location = request.headers.get("x-user-location") || "";
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get("tenant") || "";
  const { to, OTP, transaction } = (await request.json()) as TransferRequest;

  if (OTP) {
    const error = await auhtenticateOTP(OTP, email_id);
    if (error) {
      return NextResponse.json(
        { message: `OTP Failed: ${error}` },
        { status: 403 },
      );
    }
  }

  const transferAllowed = await permit.check(user, "create", {
    type: "Wire_Transfer",
    attributes: { ...transaction, to },
    tenant,
  });

  const tenantOwner = await getTenantOwner(tenant);

  if (!transferAllowed) {
    await createWireApprovalFlow({ ...transaction, to }, tenant, tenantOwner);
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

  const transactionAllowed = await permit.check(
    {
      key: user,
      attributes: { strongAuth: !!OTP, location },
    },
    "create",
    {
      type: "Transaction",
      attributes: { ...transaction },
      tenant,
    },
  );

  if (!transactionAllowed) {
    await loadStytch().otps.email.send({
      email: user,
    });
    return NextResponse.json(
      {
        message: "Wire transfer needs strong authentication",
        transfer: transaction.id,
      },
      {
        status: 403,
      },
    );
  }

  const resourceInstance = await createTransactionResource(
    transaction,
    tenant,
    tenantOwner?.key || "",
    to,
  );

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

  const { key } = (await getTenantOwner(tenant)) || { key: "" };

  const transactionInstances = await permit.getUserPermissions(
    key,
    [tenant],
    [],
    ["Transaction"],
  );

  const transactions = Object.values(transactionInstances)
    .map((transaction: any) => ({
      ...transaction.resource.attributes,
      amount: `${transaction.roles.includes("Sender") ? "-" : "+"}${transaction.resource.attributes.currency}${transaction.resource.attributes.amount}`,
    }))
    .sort((a: Transaction, b: Transaction) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  if (transactions.length === 0) {
    return NextResponse.json([generateRandomTransaction()]);
  }

  return NextResponse.json([...transactions, generateRandomTransaction()]);
}
