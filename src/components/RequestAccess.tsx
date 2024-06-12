// src/components/RequestAccess.tsx

import React, { useEffect } from "react";
import permit, { LoginMethod } from "@permitio/permit-js";

interface RequestAccessProps {
  userJwt: string;
  currentTenant: string;
}

const RequestAccess: React.FC<RequestAccessProps> = ({
  userJwt,
  currentTenant,
}) => {
  useEffect(() => {
    permit.elements
      .login({
        loginMethod: LoginMethod.frontendOnly,
        userJwt: userJwt,
        tenant: currentTenant,
        envId: process.env.NEXT_PUBLIC_ENV_ID,
      })
      .then((res: any) => {
        console.log("success", res);
      })
      .catch((err: any) => {
        console.log("err", err);
      });
  }, [userJwt, currentTenant]);

  return (
    <iframe
      title="Permit Element wire-transfer-request"
      src={`https://embed.permit.io/wire-transfer-request?envId=${process.env.NEXT_PUBLIC_ENV_ID}&darkMode=false&tenantKey=${currentTenant}`}
      width="100%"
      height="100%"
      style={{ border: "none" }}
    />
  );
};

export default RequestAccess;
