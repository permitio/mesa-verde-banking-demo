import { Transaction } from "@/lib/Model";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAccount } from "./AccountContext";

type TransactionsContextType = {
    transactions: Transaction[];
    transactionsError: string | null;
    fetchTransactions: () => void;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const useTransactions = () => {
    const context = useContext(TransactionsContext);
    if (!context) {
        throw new Error("useTransactions must be used within a TransactionsProvider");
    }
    return context;
}

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const { currentTenant } = useAccount();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsError, setTransactionsError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setTransactionsError(null);
        setTransactions([]);
        const response = await fetch(`/account/api/transactions?account=${currentTenant}`);
        const status = response.status;
        if (status === 403) {
            setTransactionsError("Unauthorized to view transactions");
            return;
        }
        const data = await response.json();
        setTransactions(data);
    }, [currentTenant]);

    useEffect(() => {
        if (currentTenant) {
            fetchTransactions();
        }
    }, [currentTenant, fetchTransactions]);

    return (
        <TransactionsContext.Provider value={{ transactions, transactionsError, fetchTransactions }}>
            {children}
        </TransactionsContext.Provider>
    );
}

