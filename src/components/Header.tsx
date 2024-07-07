// src/components/Header.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "../../src/components/AccountContext";
import { Button, Select, Spin } from "antd";

const { Option } = Select;

const Header = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const { tenants, currentTenant, handleTenantChange } = useAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenants.length > 0) {
      setLoading(false);
    }
  }, [tenants]);

  const handleChange = (value: string) => {
    handleTenantChange(value);
  };

  console.log("Tenants: ", tenants);

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/" legacyBehavior>
        <a>
          <Image
            alt="Barclays"
            src="/barclays-logo.png"
            width={150}
            height={25}
            priority={true}
          />
        </a>
      </Link>
      {stytch.session && user ? (
        <div className="flex items-center gap-4">
          {loading ? (
            <Spin />
          ) : (
            <Select
              value={currentTenant}
              onChange={handleChange}
              className="account-switcher"
              style={{ width: 200 }}
            >
              {tenants.length === 0 ? (
                <Option value="">No tenants available</Option>
              ) : (
                tenants.map((tenant: { key: string; name: string }) => (
                  <Option key={tenant.key} value={tenant.key}>
                    {tenant.name}
                  </Option>
                ))
              )}
            </Select>
          )}
          <Button type="primary" onClick={() => stytch.session.revoke()}>
            Log out
          </Button>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
