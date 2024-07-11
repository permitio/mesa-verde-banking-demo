"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStytchUser } from "@stytch/nextjs";

export default function Layout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    const { user, isInitialized } = useStytchUser();
    const router = useRouter();

    // If the Stytch SDK no longer has a User then redirect to login; for example after logging out.
    useEffect(() => {
        if (isInitialized && !user) {
            router.replace("/");
        }
    }, [user, isInitialized, router]);

    return <>
        {children}
    </>;
}
