"use client";

import React, { useState, useEffect } from "react";
import { useStytch, useStytchSession, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "@/src/components/AccountContext";
import RequestAccess from "./RequestAccess";
import UserManagement from "./UserManagement";
import { Permit } from "permitio";
import {
  Button,
  Select,
  Spin,
  Modal,
  Tooltip,
  List,
  Typography,
  Input,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title, Paragraph } = Typography;

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
  const [showRestrictedAccessModal, setShowRestrictedAccessModal] =
    useState(false);
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [showOverAmountModal, setShowOverAmountModal] = useState(false); // New state for over amount modal
  const [selectedRole, setSelectedRole] = useState<string>("Admin");
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [permitted, setPermitted] = useState<boolean | null>(null);
  const [wireTransferPermitted, setWireTransferPermitted] = useState<
    boolean | null
  >(null);
  const [reviewRequestsPermitted, setReviewRequestsPermitted] = useState<
    boolean | null
  >(null);
  const [transferAmount, setTransferAmount] = useState<string>(""); // New state for transfer amount

  function getCookies(): Record<string, string> {
    const pairs = document.cookie.split(";");
    const cookies: Record<string, string> = {};

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split("=");
      cookies[(pair[0] + "").trim()] = decodeURIComponent(
        pair.slice(1).join("="),
      );
    }

    return cookies;
  }

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
      const amount = parseFloat(transferAmount);

      // Check if the amount is over 10000
      if (amount > 10000) {
        const isPermitted = await permit.check(id, "send", {
          type: "Wire_Transfer",
          attributes: { amount: amount },
          tenant: currentTenant,
        });

        if (!isPermitted) {
          setShowOverAmountModal(true);
          return;
        }
      }

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

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };

  const handleReviewRequestsClick = () => {
    setShowReviewRequests(true);
  };

  const handleCloseReviewRequests = () => {
    setShowReviewRequests(false);
  };

  const handleRequestAccessClick = () => {
    setShowRestrictedAccessModal(false);
    setShowRequestAccessModal(true);
  };

  const handleCloseRestrictedAccess = () => {
    setShowRestrictedAccessModal(false);
  };

  const handleCloseRequestAccess = () => {
    setShowRequestAccessModal(false);
  };

  const handleCloseOverAmountModal = () => {
    setShowOverAmountModal(false);
  };

  useEffect(() => {
    if (currentTenant) {
      const data = mockData[currentTenant as keyof typeof mockData];
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

  useEffect(() => {
    if (permitted === false) {
      setShowRestrictedAccessModal(true);
    }
  }, [permitted]);

  if (permitted === null || !accountData) {
    return <Spin />;
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
    <div className="p-4">
      <div className="mt-4">
        <Title level={2}>
          {currentTenant === "saving-account-a"
            ? "Savings Account"
            : "Current Account"}
        </Title>
        <div className="mb-4">
          <Paragraph>
            Currently logged in as: {user?.emails[0].email ?? "Unknown User"}
          </Paragraph>
        </div>
        <div className="mb-4">
          <Title level={3}>Balance</Title>
          <Paragraph>{permitted ? accountData.balance : "N/A"}</Paragraph>
          {currentTenant === "saving-account-a" &&
            isSavingsAccountData(accountData) && (
              <div className="mt-2">
                <Title level={4}>Interest Rate</Title>
                <Paragraph>{accountData.interestRate}</Paragraph>
              </div>
            )}
        </div>
        <div className="mb-4">
          <Title level={3}>Latest Transactions</Title>
          <List
            bordered
            dataSource={transactionsToDisplay}
            renderItem={(transaction) => (
              <List.Item>
                <div className="flex justify-between w-full">
                  <span>{transaction.date}</span>
                  <span>{transaction.description}</span>
                  <span>{transaction.amount}</span>
                </div>
              </List.Item>
            )}
          />
        </div>
        <div className="flex gap-2">
          {permitted ? (
            <>
              <Button type="primary" onClick={handleWireTransferClick}>
                Send Wire Transfer
              </Button>
              <Button type="default" onClick={handleInviteUserClick}>
                Invite User
              </Button>
              {reviewRequestsPermitted && (
                <Button type="default" onClick={handleReviewRequestsClick}>
                  Review Wire Transfer Requests
                </Button>
              )}
            </>
          ) : (
            <Button type="primary" onClick={handleRequestAccessClick}>
              Request Access to Account
            </Button>
          )}
        </div>
      </div>

      <Modal
        title="Send Wire Transfer"
        visible={showWireTransfer}
        onCancel={handleCloseWireTransfer}
        footer={null}
        width={700}
        bodyStyle={{ height: "calc(100vh - 400px)", overflowY: "auto" }}
      >
        {wireTransferPermitted === false ? (
          <RequestAccess
            userJwt={getCookies().stytch_session_jwt}
            currentTenant={currentTenant}
          />
        ) : (
          <>
            <Select className="w-full mb-4">
              {users.map((user) => (
                <Option key={user} value={user}>
                  {user}
                </Option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseWireTransfer}>
                Cancel Wire Transfer
              </Button>
              <Button type="primary" onClick={handleWireTransferClick}>
                Send
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        title="Invite User"
        visible={showInviteUser}
        onCancel={handleCloseInviteUser}
        footer={null}
        width={700}
        bodyStyle={{ height: "calc(100vh - 400px)", overflowY: "auto" }}
      >
        <Select className="w-full mb-4">
          {users.map((user) => (
            <Option key={user} value={user}>
              {user}
            </Option>
          ))}
        </Select>
        <div className="flex items-center mb-4">
          <Select
            className="w-full"
            onChange={handleRoleChange}
            value={selectedRole}
          >
            {roles.map((role) => (
              <Option key={role.name} value={role.name}>
                {role.name}
              </Option>
            ))}
          </Select>
          <Tooltip
            title={
              roles.find((role) => role.name === selectedRole)?.description
            }
          >
            <InfoCircleOutlined className="ml-2" />
          </Tooltip>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleCloseInviteUser}>Cancel Invite</Button>
          <Button type="primary" onClick={handleCloseInviteUser}>
            Invite
          </Button>
        </div>
      </Modal>

      <Modal
        title="Review Wire Transfer Requests"
        visible={showReviewRequests}
        onCancel={handleCloseReviewRequests}
        footer={null}
        width={700}
        bodyStyle={{ height: "calc(100vh - 200px)", overflowY: "auto" }}
      >
        <UserManagement
          userJwt={getCookies().stytch_session_jwt}
          currentTenant={currentTenant}
        />
        <div className="flex justify-end mt-4">
          <Button onClick={handleCloseReviewRequests}>Close</Button>
        </div>
      </Modal>

      <Modal
        title="Restricted Access"
        visible={showRestrictedAccessModal}
        onCancel={handleCloseRestrictedAccess}
        footer={[
          <Button key="close" onClick={handleCloseRestrictedAccess}>
            Close
          </Button>,
          <Button
            key="request"
            type="primary"
            onClick={handleRequestAccessClick}
          >
            Request Access to Account
          </Button>,
        ]}
        width={400}
      >
        <Paragraph>
          You are a limited user and do not have access to view the account
          balance or the full transaction history. Please request access from
          the administrator.
        </Paragraph>
      </Modal>

      <Modal
        title="Request Access to Account"
        visible={showRequestAccessModal}
        onCancel={handleCloseRequestAccess}
        footer={[
          <Button key="close" onClick={handleCloseRequestAccess}>
            Close
          </Button>,
        ]}
        width={700}
        bodyStyle={{ height: "calc(100vh - 400px)", overflowY: "auto" }}
      >
        <RequestAccess
          userJwt={getCookies().stytch_session_jwt}
          currentTenant={currentTenant}
        />
      </Modal>

      <Modal
        title="Permission Denied"
        visible={showOverAmountModal}
        onCancel={handleCloseOverAmountModal}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={handleCloseOverAmountModal}
          >
            Close
          </Button>,
        ]}
        width={400}
      >
        <Paragraph>
          Only Account Owners can send wire transfers over $10,000 USD.
        </Paragraph>
      </Modal>
    </div>
  );
};

export default Profile;
