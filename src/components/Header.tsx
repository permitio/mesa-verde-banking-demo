// src/components/Header.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "../../src/components/AccountContext";
import { Button, Modal, Select, Spin } from "antd";
import Title from "antd/es/typography/Title";
import permit from "@permitio/permit-js";

const { Option } = Select;

const Header = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();

  const openTOTPModal = useCallback(async () => {

  }, [user])


  const logOut = useCallback(async () => {
    await permit.elements.logout();
    stytch.session.revoke();
    window.location.reload();
  }, [stytch])


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
            <a href="" onClick={openTOTPModal}>
              {user?.emails?.[0]?.email ?? "Unknown User"}
            </a>
          </span>
          <Button type="primary" onClick={logOut}>
            Log out
          </Button>
        </div>
      ) : null}
      <Modal
        title="Enable Two-Factor Authentication"
        open={false}
        onCancel={openTOTPModal}
        footer={null}
      >
      </Modal>
    </header>
  );
};

export default Header;
