// src/components/UserManagement.jsx

import React, { useEffect } from "react";
import permit, { LoginMethod } from "@permitio/permit-js";

const UserManagement = ({ userJwt, currentTenant }) => {
  useEffect(() => {
    permit.elements
      .login({
        loginMethod: LoginMethod.frontendOnly,
        userJwt: userJwt,
        tenant: currentTenant,
        envId: process.env.NEXT_PUBLIC_ENV_ID,
      })
      .then((res) => {
        console.log("success", res);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, [userJwt, currentTenant]);

  return (
    <iframe
      title="Permit Element barclays-wire-transfer"
      src={`https://embed.permit.io/barclays-wire-transfer?envId=${process.env.NEXT_PUBLIC_ENV_ID}&darkMode=false`}
      width="100%"
      height="100%"
      style={{ border: "none" }}
    />
  );
};

export default UserManagement;
