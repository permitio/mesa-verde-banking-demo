// src/components/Header.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "../../src/components/AccountContext";
import { Button, Select, Spin } from "antd";
import Title from "antd/es/typography/Title";
import permit from "@permitio/permit-js";

const { Option } = Select;

const Header = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();

  const logOut = async () => {
    await permit.elements.logout();
    stytch.session.revoke();
    window.location.reload();
  }

  
  return (
    <header className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/" legacyBehavior>
        <div className="flex flex-col items-center">
          <div className="text-xl text-slate-700">MESA VERDE</div>
          <div className="text-lg  text-slate-600">Bank and Trust</div>
        </div>
      </Link>
      {stytch.session && user ? (
        <div className="flex items-center gap-4">
          <span className="text-slate-700">
            {user?.emails?.[0]?.email ?? "Unknown User"}
          </span>
          <Button type="primary" onClick={logOut}>
            Log out
          </Button>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
