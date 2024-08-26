

import React, { FC, useEffect, useState } from "react";
import permit, { LoginMethod } from "@permitio/permit-js";

type OperationApprovalRequestProps = {
    currentTenant: string;
    transferKey: string;
};

const OperationApprovalRequest: FC<OperationApprovalRequestProps> = ({ currentTenant, transferKey }) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const login = async () => {
            setError("");
            setLoading(true);
            try {
                await permit.elements.logout();
                await permit.elements.login({
                    tenant: currentTenant,
                    loginUrl: "/account/api/elements-login?tenant=" + currentTenant,
                    loginMethod: LoginMethod.cookie
                });
            } catch (error) {
                console.warn("Error logging in", error);
                setError("Error logging in. Please try again.");
            }
            setLoading(false);
        };
        login();
    }, [currentTenant]);

    return (
        <>
            {error && <div>{error}</div>}
            {!error && !loading && (
                <iframe
                    title="Operation Approval Request"
                    src={`https://embed.permit.io/wire-transfer-approval-request?envId=${process.env.NEXT_PUBLIC_ENV_ID}&darkMode=false&resourceInstanceKey=${transferKey}&tenantKey=${currentTenant}`}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                />
            )}
        </>
    );
};

export default OperationApprovalRequest;
