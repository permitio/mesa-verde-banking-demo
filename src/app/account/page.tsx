"use client";

import AccountToolbar from "@/src/components/AccountToolbar";
import Balance from "@/src/components/Balance";
import TenantsDropdown from "@/src/components/TenantsDropdown";
import Transactions from "@/src/components/Transactions";
import { TransactionsProvider } from "@/src/components/TransactionsContext";

export default function ProfilePage() {
    return (
        <>
            <div className="flex flex-col justify-between items-justify gap-4">
                <TransactionsProvider>
                    <TenantsDropdown />
                    <AccountToolbar />
                    <Balance />
                    <Transactions />
                </TransactionsProvider>
            </div>
        </>
    );
}
