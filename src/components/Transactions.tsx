import { FC, use, useEffect, useState } from "react";
import { useAccount } from "./AccountContext";
import { Skeleton, Table } from "antd";
import { Transaction } from "@/lib/Model";

const columns = [
    {
        title: "Date",
        dataIndex: "date",
        key: "date",
    },
    {
        title: "Description",
        dataIndex: "description",
        key: "description",
    },
    {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
    },
];

const Transactions: FC = () => {
    const { currentTenant } = useAccount();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setError(null);
            setTransactions([]);
            const response = await fetch(`/account/api/transactions?account=${currentTenant}`);
            const status = response.status;
            if (status === 403) {
                setError("Unauthorized to view transactions");
                return;
            }
            const data = await response.json();
            setTransactions(data);
        }
        if (currentTenant) {
            fetchTransactions();
        }
    }, [currentTenant]);

    return (
        <>
            {error && <div className="w-full text-center text-lg">{error}</div>}
            {!transactions.length && !error && <Skeleton active className="!w-full" />}
            {!error && transactions.length > 0 &&
                <div>
                    <Table
                        columns={columns}
                        dataSource={transactions.map((transaction) => ({
                            ...transaction,
                            key: transaction.id,
                        }))}
                        pagination={false}
                    />
                </div>
            }
        </>
    );
}

export default Transactions;