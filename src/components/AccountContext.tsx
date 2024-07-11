"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { UserRead } from "permitio";

type Tenant = {
  id: string;
  key: string;
  name: string;
};

type AccountContextType = {
  tenants: Tenant[];
  currentTenant: string;
  allUsers: UserRead[];
  handleTenantChange: (tenantKey: string) => void;
  setIsUserSynced: (synced: boolean) => void;
  userJwt: string;
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
  const stytch = useStytch();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<string>("");
  const [allUsers, setAllUsers] = useState<UserRead[]>([]);
  const [isUserSynced, setIsUserSynced] = useState<boolean>(false);
  const [userJwt, setUserJwt] = useState<string>("");
  

  useEffect(() => {
    const getTenants = async () => {
      console.log("USER TEST: ", user);

      try {
        if (user && !isUserSynced) {
          setUserJwt(stytch.session.getTokens()?.session_jwt || "");

          const getUserTenants = await (
            await fetch(`/account/api/tenants`)
          ).json();

          console.log("USER TENANTS: ", getUserTenants);
          setTenants(getUserTenants);

          if (getUserTenants.length > 0) {
            setCurrentTenant(getUserTenants[0].key); // Use tenant key
          }

          const getAllUsers = await fetch("/account/api/users");
          if (!getAllUsers.ok) {
            throw new Error("Failed to fetch users");
          }
          const allUsers = await getAllUsers.json() as UserRead[];
          console.log("ALL USERS: ", allUsers);
          setAllUsers(allUsers);
          setIsUserSynced(true);
        }
      } catch (error) {
        console.error("Failed to fetch tenants", error);
      }
    };
    getTenants();
  }, [user, isUserSynced, stytch]);

  const handleTenantChange = (tenantKey: string) => {
    setCurrentTenant(tenantKey);
  };

  return (
    <AccountContext.Provider
      value={{
        tenants,
        currentTenant,
        allUsers,
        handleTenantChange,
        setIsUserSynced,
        userJwt,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
