"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useStytchUser } from "@stytch/nextjs";

type Tenant = {
  id: string;
  key: string; // Add tenant key
  name: string;
};

type AccountContextType = {
  tenants: Tenant[];
  currentTenant: string;
  allUsers: string[];
  handleTenantChange: (tenantKey: string) => void;
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
  const { user } = useStytchUser();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<string>("");
  const [allUsers, setAllUsers] = useState<string[]>([]);

  useEffect(() => {
    const getTenants = async () => {
      try {
        if (user) {
          const getUserTenants = await (
            await fetch(`/profile/api/tenants?id=${user.user_id}`)
          ).json();

          console.log("USER TENANTS: ", getUserTenants);
          setTenants(getUserTenants);

          if (getUserTenants.length > 0) {
            setCurrentTenant(getUserTenants[0].key); // Use tenant key
          }

          const getAllUsers = await fetch("/profile/api/users");
          if (!getAllUsers.ok) {
            throw new Error("Failed to fetch users");
          }
          const allUsers = await getAllUsers.json();
          console.log("ALL USERS: ", allUsers);
          setAllUsers(allUsers);
        }
      } catch (error) {
        console.error("Failed to fetch tenants", error);
      }
    };
    getTenants();
  }, [user]);

  const handleTenantChange = (tenantKey: string) => {
    setCurrentTenant(tenantKey);
  };

  return (
    <AccountContext.Provider
      value={{ tenants, currentTenant, allUsers, handleTenantChange }}
    >
      {children}
    </AccountContext.Provider>
  );
};
