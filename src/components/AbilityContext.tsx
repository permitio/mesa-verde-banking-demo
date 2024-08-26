"use client";

import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Ability } from "@casl/ability";
import { Permit, permitState } from "permit-fe-sdk";
import { useStytchUser } from "@stytch/nextjs";
import { useAccount } from "./AccountContext";

type AbiltiyContextType = {
    abilities: Abilities | null;
};

enum PermissionName {
    READ_ACCOUNT = "READ_ACCOUNT",
    LIST_TRANSACTIONS = "LIST_TRANSACTIONS",
    CREATE_WIRE_TRANSFER = "CREATE_WIRE_TRANSFER",
    ADD_MEMBERS = "ADD_MEMBERS",
    APPROVE_WIRE_TRANSFER = "APPROVE_WIRE_TRANSFER",
}

type Permission = {
    name: PermissionName;
    statement: {
        action: string;
        resource: string;
        resourceAttributes?: { [key: string]: any };
    };
};

export type Abilities = {
    [key in PermissionName]: boolean;
}

const PERMISSIONS: Permission[] = [{
    name: PermissionName.READ_ACCOUNT,
    statement: { action: "read", resource: "Account" },
}, {
    name: PermissionName.LIST_TRANSACTIONS,
    statement: { action: "list", resource: "Transaction" },
}, {
    name: PermissionName.CREATE_WIRE_TRANSFER,
    statement: { action: "create", resource: "Wire_Transfer", resourceAttributes: { amount: 100 } },
}, {
    name: PermissionName.ADD_MEMBERS,
    statement: { action: "add-members", resource: "Account" },
}, {
    name: PermissionName.APPROVE_WIRE_TRANSFER,
    statement: { action: "approve", resource: "Wire_Transfer" },

}];

// Create Context
const AbilityContext = createContext<AbiltiyContextType | undefined>(undefined);

export const useAuthorization = () => {
    const context = useContext(AbilityContext);
    if (!context) {
        throw new Error("useAccount must be used within an AccountProvider");
    }
    return context;
};

export const AbilityLoader = ({ children }: { children: ReactNode }) => {
    const { user } = useStytchUser();
    const { currentTenant } = useAccount();
    const [abilities, setAbilities] = useState<Abilities | null>(null);

    useEffect(() => {
        const fetchAbilities = async () => {
            setAbilities(null);
            const permissions = await fetch(`/account/api/frontend-permissions?tenant=${currentTenant}`, {
                method: "POST",
                body: JSON.stringify({
                    resourcesAndActions: [...PERMISSIONS.map(p => p.statement)]
                }),
            });
            const permissionsJson = await permissions.json();

            setAbilities(permissionsJson.permittedList.reduce((acc: Abilities, permitted: boolean, index: number) => {
                const permission = PERMISSIONS[index];
                return { ...acc, [permission.name]: permitted };
            }));
        };

        if (user && currentTenant) {
            fetchAbilities()
        }
    }, [user, currentTenant]);

    return <AbilityContext.Provider value={{ abilities }}>{children}</AbilityContext.Provider>;
};