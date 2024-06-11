"use client";

import React from "react";
import { StytchLogin } from "@stytch/nextjs";
import { Products } from "@stytch/vanilla-js";
import { getDomainFromWindow } from "../../lib/urlUtils";

const Login = () => {
  const styles = {
    container: {
      width: "100%",
    },
    buttons: {
      primary: {
        backgroundColor: "#4A37BE",
        borderColor: "#4A37BE",
      },
    },
  };

  const config = {
    products: [Products.emailMagicLinks, Products.oauth, Products.otp],
    emailMagicLinksOptions: {
      loginRedirectURL: getDomainFromWindow() + "/authenticate",
      loginExpirationMinutes: 60,
      signupRedirectURL: getDomainFromWindow() + "/authenticate",
      signupExpirationMinutes: 60,
    },
  } as Parameters<typeof StytchLogin>[0]["config"];

  return <StytchLogin config={config} styles={styles} />;
};

export default Login;
