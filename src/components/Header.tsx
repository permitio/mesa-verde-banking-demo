"use client";

import Image from "next/image";
import Link from "next/link";
import { useStytch, useStytchSession, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "@/src/components/AccountContext";

const Header = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const { session } = useStytchSession();
  const { currentAccount, toggleAccount } = useAccount();

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
      {session ? (
        <div className="link-container">
          <select
            className="account-switcher"
            onChange={toggleAccount}
            value={currentAccount ? "current" : "savings"}
          >
            <option value="current">Current Account</option>
            <option value="savings">Savings Account</option>
          </select>
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
