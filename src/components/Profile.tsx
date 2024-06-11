"use client";

import React, { useState } from "react";
import { useStytch, useStytchSession, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "@/src/components/AccountContext";
import { Permit } from "permitio";

const permit = new Permit({
  token: process.env.NEXT_PUBLIC_PERMIT_API_KEY,
  pdp: "http://localhost:7766",
});

type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: string;
};

type CurrentAccountData = {
  balance: string;
  transactions: Transaction[];
};

type SavingsAccountData = {
  balance: string;
  interestRate: string;
  transactions: Transaction[];
};

type AccountData = CurrentAccountData | SavingsAccountData;

const Profile: React.FC = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const { session } = useStytchSession();
  const { currentAccount } = useAccount();
  const [showWireTransfer, setShowWireTransfer] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("Admin");

  const users = [
    "filip@permit.io",
    "filip+1@permit.io",
    "filip+2@permit.io",
    "filip+3@permit.io",
  ];
  const roles = [
    { name: "Admin", description: "Can manage everything in your account" },
    {
      name: "Manager",
      description: "Can only manage transactions and investments Mon-Fri",
    },
    {
      name: "Viewer",
      description:
        "Can only look at your current balance and past 3 transactions",
    },
  ];

  const handleWireTransferClick = () => {
    setShowWireTransfer(true);
  };

  const handleCloseWireTransfer = () => {
    setShowWireTransfer(false);
  };

  const handleInviteUserClick = () => {
    setShowInviteUser(true);
  };

  const handleCloseInviteUser = () => {
    setShowInviteUser(false);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  const mockDataCurrent: CurrentAccountData = {
    balance: "£5,000.00",
    transactions: [
      {
        id: 1,
        date: "2024-06-01",
        description: "Grocery Store",
        amount: "-£50.00",
      },
      {
        id: 2,
        date: "2024-06-03",
        description: "Salary",
        amount: "+£3,000.00",
      },
      {
        id: 3,
        date: "2024-06-05",
        description: "Electricity Bill",
        amount: "-£100.00",
      },
      { id: 4, date: "2024-06-07", description: "Rent", amount: "-£1,500.00" },
      {
        id: 5,
        date: "2024-06-09",
        description: "Coffee Shop",
        amount: "-£5.00",
      },
      {
        id: 6,
        date: "2024-06-10",
        description: "Subscription",
        amount: "-£15.00",
      },
    ],
  };

  const mockDataSavings: SavingsAccountData = {
    balance: "£10,000.00",
    interestRate: "3.6%",
    transactions: [
      { id: 1, date: "2024-06-01", description: "Interest", amount: "+£50.00" },
      {
        id: 2,
        date: "2024-06-03",
        description: "Deposit",
        amount: "+£5,000.00",
      },
      {
        id: 3,
        date: "2024-06-05",
        description: "Deposit",
        amount: "+£3,000.00",
      },
      { id: 4, date: "2024-06-07", description: "Interest", amount: "+£30.00" },
    ],
  };

  const accountData: AccountData = currentAccount
    ? mockDataCurrent
    : mockDataSavings;

  // Type guard to check if accountData is SavingsAccountData
  const isSavingsAccountData = (
    data: AccountData,
  ): data is SavingsAccountData => {
    return "interestRate" in data;
  };

  return (
    <div className="profile">
      <h2>User object</h2>
      <pre className="code-block">
        <code>{JSON.stringify(session, null, 2)}</code>
      </pre>

      <div className="dashboard">
        <h2>{currentAccount ? "Current Account" : "Savings Account"}</h2>
        <div className="balance">
          <h3>Balance</h3>
          <p>{accountData.balance}</p>
          {!currentAccount && isSavingsAccountData(accountData) && (
            <div className="interest-rate">
              <h4>Interest Rate</h4>
              <p>{accountData.interestRate}</p>
            </div>
          )}
        </div>
        <div className="transactions">
          <h3>Latest Transactions</h3>
          <ul>
            {accountData.transactions.map((transaction) => (
              <li key={transaction.id}>
                <span className="date">{transaction.date}</span>
                <span className="description">{transaction.description}</span>
                <span className="amount">{transaction.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="actions">
          {currentAccount ? (
            <>
              <button
                className="action-button"
                onClick={() => alert("Add Money Clicked")}
              >
                Add Money
              </button>
              <button
                className="action-button"
                onClick={() => alert("Exchange Money Clicked")}
              >
                Exchange Money
              </button>
              <button
                className="action-button"
                onClick={handleWireTransferClick}
              >
                Send Wire Transfer
              </button>
              <button className="action-button" onClick={handleInviteUserClick}>
                Invite User
              </button>
            </>
          ) : (
            <>
              <button
                className="action-button"
                onClick={() => alert("Add Money Clicked")}
              >
                Add Money
              </button>
              <button
                className="action-button"
                onClick={() => alert("Withdraw Money Clicked")}
              >
                Withdraw Money
              </button>
            </>
          )}
        </div>
      </div>

      {showWireTransfer && (
        <div className="wire-transfer-popup" onClick={handleCloseWireTransfer}>
          <div
            className="wire-transfer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Send Wire Transfer</h3>
            <select className="dropdown">
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              className="amount-input"
            />
            <button className="action-button" onClick={handleCloseWireTransfer}>
              Send
            </button>
            <button className="action-button" onClick={handleCloseWireTransfer}>
              Cancel Wire Transfer
            </button>
          </div>
        </div>
      )}

      {showInviteUser && (
        <div className="invite-user-popup" onClick={handleCloseInviteUser}>
          <div
            className="invite-user-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Invite User</h3>
            <select className="dropdown">
              {users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <div className="role-selection">
              <select
                className="dropdown"
                onChange={handleRoleChange}
                value={selectedRole}
              >
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <span
                className="info-icon"
                data-tooltip={
                  roles.find((role) => role.name === selectedRole)?.description
                }
              >
                ℹ️
              </span>
            </div>
            <button className="action-button" onClick={handleCloseInviteUser}>
              Invite
            </button>
            <button className="action-button" onClick={handleCloseInviteUser}>
              Cancel Invite
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          padding: 20px;
        }

        .balance,
        .transactions,
        .actions {
          margin-bottom: 20px;
        }

        .transactions ul {
          list-style-type: none;
          padding: 0;
        }

        .transactions li {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }

        .date,
        .description,
        .amount {
          flex: 1;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .action-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .action-button:hover {
          background-color: #0056b3;
        }

        .wire-transfer-popup,
        .invite-user-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .wire-transfer-content,
        .invite-user-content {
          background-color: #fff;
          padding: 60px;
          border-radius: 8px;
          text-align: center;
          width: 500px;
        }

        .dropdown {
          display: block;
          margin: 10px 0;
          padding: 10px;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .amount-input {
          display: block;
          margin: 10px 0;
          padding: 10px;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .role-selection {
          position: relative;
          display: flex;
          align-items: center;
        }

        .info-icon {
          margin-left: 10px;
          cursor: pointer;
        }

        .info-icon::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #000;
          color: #fff;
          padding: 5px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .info-icon:hover::after {
          opacity: 1;
          visibility: visible;
        }

        .interest-rate {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Profile;
