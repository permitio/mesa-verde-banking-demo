import { FC, use, useEffect, useState } from "react";
import { useAccount } from "./AccountContext";
import { Skeleton, Table, TableColumnProps } from "antd";
import { Transaction } from "@/lib/Model";
import { useTransactions } from "./TransactionsContext";

const columns = [
    {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (date: string) => new Date(date).toLocaleString(),
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
    const { transactions, transactionsError } = useTransactions();

    return (
        <>
            {transactionsError && <div className="w-full text-center text-lg">{transactionsError}</div>}
            {!transactions.length && !transactionsError && <Skeleton active className="!w-full" />}
            {!transactionsError && transactions.length > 0 &&
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