// src/components/RequestAccess.tsx

import React, { useEffect, useState } from "react";
import permit, { LoginMethod } from "@permitio/permit-js";

interface RequestAccessProps {
  currentTenant: string;
}

const RequestAccess: React.FC<RequestAccessProps> = ({
  currentTenant,
}) => {
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
          title="Permit Element wire-transfer-request"
          src={`https://embed.permit.io/wire-transfer-request?envId=${process.env.NEXT_PUBLIC_ENV_ID}&darkMode=false&tenantKey=${currentTenant}`}
          className="w-full h-full"
        />
      )}
    </>
  );
};

export default RequestAccess;
