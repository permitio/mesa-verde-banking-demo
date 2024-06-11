"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type AccountContextType = {
  currentAccount: boolean;
  toggleAccount: () => void;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState(true);

  const toggleAccount = () => {
    setCurrentAccount((prevAccount) => !prevAccount);
  };

  return (
    <AccountContext.Provider value={{ currentAccount, toggleAccount }}>
      {children}
    </AccountContext.Provider>
  );
};
