// src/components/Header.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStytch } from "@stytch/nextjs";
import { useAccount } from "../../src/components/AccountContext";

const Header = () => {
  const stytch = useStytch();
  const { tenants, currentTenant, handleTenantChange } = useAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenants.length > 0) {
      setLoading(false);
    }
    console.log("TENANTS in useEffect: ", tenants); // Add this log to verify tenants in useEffect
  }, [tenants]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleTenantChange(event.target.value);
  };

  console.log("TENANTS: ", tenants); // Ensure this log is before the return

  return (
    <header>
      <Link className="header" href="/">
        <Image
          alt="Barclays"
          src="/barclays-logo.png"
          width={150}
          height={25}
          priority={true}
        />
      </Link>
      {stytch.session ? (
        <div className="link-container">
          {loading ? (
            <p>Loading tenants...</p>
          ) : (
            <select
              className="account-switcher"
              onChange={handleChange}
              value={currentTenant}
            >
              {tenants.length === 0 ? (
                <option value="">No tenants available</option>
              ) : (
                tenants.map((tenant: { key: string; name: string }) => (
                  <option key={tenant.key} value={tenant.key}>
                    {tenant.name}
                  </option>
                ))
              )}
            </select>
          )}
          <button className="primary" onClick={() => stytch.session.revoke()}>
            Log out
          </button>
        </div>
      ) : null}

      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #f8f9fa;
        }

        .link-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .primary {
          padding: 5px 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .primary:hover {
          background-color: #0056b3;
        }

        .account-switcher {
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </header>
  );
};

export default Header;
