import { FC, useEffect, useState } from "react";
import { useAccount } from "./AccountContext";
import { Skeleton } from "antd";

const Balance: FC = () => {
    const { currentTenant } = useAccount();
    const [balance, setBalance] = useState<number | null>(null);
    const [currency, setCurrency] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchBalance = async () => {
            const response = await fetch(`/account/api/balance/?account=${currentTenant}`);
            const data = await response.json();
            setBalance(data[0].balance);
            setCurrency(data[0].currency);
            setLoading(false);
        }
        if (currentTenant) {
            fetchBalance();
            setCurrency(null);
            setBalance(null);
        }
    }, [currentTenant]);

    return (
        <div>
            {!currency && !balance ? (
                <Skeleton.Input active className="!w-full" />
            ) : (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-lg text-slate-600 font-semibold">Balance: </span>
                    <span className="text-xl">{currency}{balance?.toString()}</span>
                </div>
            )}
        </div>
    );
};

export default Balance;