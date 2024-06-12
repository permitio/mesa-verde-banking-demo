"use client";

import React, { useState, useEffect } from "react";
import { useStytch, useStytchSession, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "@/src/components/AccountContext";
import RequestAccess from "./RequestAccess";
import UserManagement from "./UserManagement";
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

const mockData = {
  "current-account-a": {
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
  },
  "current-account-b": {
    balance: "£3,000.00",
    transactions: [
      {
        id: 1,
        date: "2024-06-01",
        description: "Grocery Store",
        amount: "-£30.00",
      },
      {
        id: 2,
        date: "2024-06-03",
        description: "Salary",
        amount: "+£2,000.00",
      },
      {
        id: 3,
        date: "2024-06-05",
        description: "Electricity Bill",
        amount: "-£80.00",
      },
      { id: 4, date: "2024-06-07", description: "Rent", amount: "-£1,200.00" },
      {
        id: 5,
        date: "2024-06-09",
        description: "Coffee Shop",
        amount: "-£10.00",
      },
      {
        id: 6,
        date: "2024-06-10",
        description: "Subscription",
        amount: "-£20.00",
      },
    ],
  },
  "saving-account-a": {
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
  },
};

const Profile: React.FC = () => {
  const stytch = useStytch();
  const { user } = useStytchUser();
  const { session } = useStytchSession();
  const { currentTenant } = useAccount();
  const [showWireTransfer, setShowWireTransfer] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showReviewRequests, setShowReviewRequests] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("Admin");
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [permitted, setPermitted] = useState<boolean | null>(null);
  const [wireTransferPermitted, setWireTransferPermitted] = useState<
    boolean | null
  >(null);
  const [reviewRequestsPermitted, setReviewRequestsPermitted] = useState<
    boolean | null
  >(null);

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

  const handleWireTransferClick = async () => {
    if (user && currentTenant) {
      const id = user.user_id;
      const isPermitted = await permit.check(id, "send", {
        type: "Wire_Transfer",
        tenant: currentTenant,
      });

      console.log(
        `User ${id} is ${isPermitted ? "" : "NOT "}PERMITTED to send wire transfer.`,
      );
      setWireTransferPermitted(isPermitted);
    }
    setShowWireTransfer(true);
  };

  const handleCloseWireTransfer = () => {
    setShowWireTransfer(false);
    setWireTransferPermitted(null);
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

  const handleReviewRequestsClick = () => {
    setShowReviewRequests(true);
  };

  const handleCloseReviewRequests = () => {
    setShowReviewRequests(false);
  };

  useEffect(() => {
    console.log("Current Tenant: ", currentTenant);
    if (currentTenant) {
      const data = mockData[currentTenant as keyof typeof mockData];
      console.log("Fetched Account Data: ", data);
      setAccountData(data);
    }
  }, [currentTenant]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (user && currentTenant) {
        const id = user.user_id;
        const isPermitted = await permit.check(id, "view-all", {
          type: "Account",
          tenant: currentTenant,
        });

        console.log(
          `User ${id} is ${isPermitted ? "" : "NOT "}PERMITTED to view all.`,
        );
        setPermitted(isPermitted);

        const canReviewRequests = await permit.check(id, "review-requests", {
          type: "Wire_Transfer",
          tenant: "current-account-b",
        });
        console.log(
          `User ${id} is ${canReviewRequests ? "" : "NOT "}PERMITTED to review wire transfer requests.`,
        );
        setReviewRequestsPermitted(canReviewRequests);
      }
    };

    checkPermissions();
  }, [user, currentTenant]);

  if (permitted === null || !accountData) {
    return <div>Loading...</div>;
  }

  const isSavingsAccountData = (
    data: AccountData,
  ): data is SavingsAccountData => {
    return "interestRate" in data;
  };

  const transactionsToDisplay = permitted
    ? accountData.transactions
    : accountData.transactions.slice(0, 3);

  return (
    <div className="profile">
      <h2>User object</h2>
      <pre className="code-block">
        <code>{JSON.stringify(user, null, 2)}</code>
        <code>{JSON.stringify(session, null, 2)}</code>
      </pre>

      <div className="dashboard">
        <h2>
          {currentTenant === "saving-account-a"
            ? "Savings Account"
            : "Current Account"}
        </h2>
        <div className="user-info">
          <p>
            Currently logged in as: {user?.emails[0].email ?? "Unknown User"}
          </p>
        </div>
        <div className="balance">
          <h3>Balance</h3>
          <p>{permitted ? accountData.balance : "N/A"}</p>
          {currentTenant === "saving-account-a" &&
            isSavingsAccountData(accountData) && (
              <div className="interest-rate">
                <h4>Interest Rate</h4>
                <p>{accountData.interestRate}</p>
              </div>
            )}
        </div>
        <div className="transactions">
          <h3>Latest Transactions</h3>
          <ul>
            {transactionsToDisplay.map((transaction) => (
              <li key={transaction.id}>
                <span className="date">{transaction.date}</span>
                <span className="description">{transaction.description}</span>
                <span className="amount">{transaction.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        {!permitted && (
          <div className="limited-user-message">
            <p>
              You are a limited user therefore you cannot see the account
              balance nor the whole transaction history.
            </p>
          </div>
        )}
        <div className="actions">
          <button className="action-button" onClick={handleWireTransferClick}>
            Send Wire Transfer
          </button>
          <button className="action-button" onClick={handleInviteUserClick}>
            Invite User
          </button>
          {reviewRequestsPermitted && (
            <button
              className="action-button"
              onClick={handleReviewRequestsClick}
            >
              Review Wire Transfer Requests
            </button>
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
            {wireTransferPermitted === false ? (
              <RequestAccess
                userJwt={process.env.NEXT_PUBLIC_JWT}
                currentTenant={currentTenant}
              />
            ) : (
              <>
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
                <button
                  className="action-button"
                  onClick={handleCloseWireTransfer}
                >
                  Send
                </button>
                <button
                  className="action-button"
                  onClick={handleCloseWireTransfer}
                >
                  Cancel Wire Transfer
                </button>
              </>
            )}
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

      {showReviewRequests && (
        <div
          className="review-requests-popup"
          onClick={handleCloseReviewRequests}
        >
          <div
            className="review-requests-content"
            onClick={(e) => e.stopPropagation()}
          >
            <UserManagement
              userJwt={process.env.NEXT_PUBLIC_JWT}
              currentTenant={currentTenant}
            />
            <button
              className="action-button"
              onClick={handleCloseReviewRequests}
            >
              Close
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
        .invite-user-popup,
        .review-requests-popup {
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
        .invite-user-content,
        .review-requests-content {
          background-color: #fff;
          padding: 60px;
          border-radius: 8px;
          text-align: center;
          width: 500px;
          height: 800px;
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

        .limited-user-message {
          color: red;
          font-weight: bold;
          margin-top: 20px;
        }

        .user-info {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default Profile;
