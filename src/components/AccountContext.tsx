"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchTenantsForUser, fetchAllUsers } from "../../src/api/FetchTenants";
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
          const fetchedTenants = await fetchTenantsForUser(user.user_id);
          setTenants(fetchedTenants);

          const fetchedAllUsers = await fetchAllUsers();
          setAllUsers(fetchedAllUsers);

          if (fetchedTenants.length > 0) {
            setCurrentTenant(fetchedTenants[0].key); // Use tenant key
          }
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
