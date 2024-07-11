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
    const randomDescription = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
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
  const tenant = searchParams.get("account") || "";

  const allowed = await permit.check(user, "create", {
    type: "Transaction",
    tenant,
  });
  if (!allowed) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  return NextResponse.json({
    id: Math.floor(Math.random() * 1000),
    ...body,
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
