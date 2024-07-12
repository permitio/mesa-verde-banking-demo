"use client";

import AccountToolbar from "@/src/components/AccountToolbar";
import Balance from "@/src/components/Balance";
import TenantsDropdown from "@/src/components/TenantsDropdown";
import Transactions from "@/src/components/Transactions";

export default function ProfilePage() {
    return (
        <>
            <div className="flex flex-col justify-between items-justify gap-4">
                <TenantsDropdown />
                <AccountToolbar />
                <Balance />
                <Transactions />
            </div>
        </>
    );
}
