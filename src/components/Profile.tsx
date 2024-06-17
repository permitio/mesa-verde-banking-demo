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
  Table,
  Typography,
  Input,
  notification,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { fetchTenantsForUser, fetchAllUsers } from "../api/FetchTenants";

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

type Tenant = {
  id: string;
  key: string; // Add tenant key
  name: string;
};

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
  const { currentTenant, allUsers } = useAccount();
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
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null,
  );
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const currentUserEmail = user?.emails[0].email ?? "";

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
    "filip+test@permit.io",
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

  useEffect(() => {
    if (!localStorage.getItem("accountData")) {
      localStorage.setItem("accountData", JSON.stringify(mockData));
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchTenantsForUser(selectedUser).then(setUserTenants);
    }
  }, [selectedUser]);

  const handleOpenWireTransferModal = () => {
    setShowWireTransfer(true);
  };

  const handleWireTransferSubmit = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      notification.error({
        message: "Invalid Transfer Amount",
        description: "Please enter a valid transfer amount.",
      });
      return;
    }

    if (user && currentTenant && selectedUserEmail) {
      const id = user.user_id;
      const amount = parseFloat(transferAmount);

      console.log("AMOUNT: ", amount);

      const isPermitted = await permit.check(id, "send", {
        type: "Wire_Transfer",
        attributes: { amount: amount },
        tenant: currentTenant,
      });

      if (!isPermitted) {
        setShowOverAmountModal(true);
        return;
      } else {
        const data = JSON.parse(localStorage.getItem("accountData") || "{}");

        if (data[currentTenant]) {
          data[currentTenant].balance = (
            parseFloat(data[currentTenant].balance.replace(/[^0-9.-]+/g, "")) -
            parseFloat(transferAmount)
          ).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

          data[currentTenant].transactions.push({
            id: data[currentTenant].transactions.length + 1,
            date: new Date().toISOString().split("T")[0],
            description: `Outbound transfer to ${selectedUserEmail}`,
            amount: `-£${parseFloat(transferAmount).toFixed(2)}`,
          });

          // Update local storage
          localStorage.setItem("accountData", JSON.stringify(data));
        }

        if (selectedTenant && data[selectedTenant]) {
          data[selectedTenant].balance = (
            parseFloat(data[selectedTenant].balance.replace(/[^0-9.-]+/g, "")) +
            parseFloat(transferAmount)
          ).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

          data[selectedTenant].transactions.push({
            id: data[selectedTenant].transactions.length + 1,
            date: new Date().toISOString().split("T")[0],
            description: `Wire transfer received from ${currentUserEmail}`,
            amount: `+£${parseFloat(transferAmount).toFixed(2)}`,
          });

          // Update local storage
          localStorage.setItem("accountData", JSON.stringify(data));
        }

        setShowWireTransfer(false);
        setTransferAmount("");
        setSelectedUser(null);
        setSelectedTenant(null);

        console.log(
          `User ${id} is ${isPermitted ? "" : "NOT "}PERMITTED to send wire transfer.`,
        );
        setWireTransferPermitted(isPermitted);

        // Show success message and close the modal
        notification.success({
          message: "Wire Transfer Successful",
          description: `Outbound transfer of £${transferAmount} to ${selectedUserEmail}.`,
        });

        setShowWireTransfer(false);
      }
    }
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
      const data = JSON.parse(localStorage.getItem("accountData") || "{}");
      setAccountData(data[currentTenant as keyof typeof mockData]);
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

  const sortedTransactions = accountData.transactions
    .slice()
    .sort((a, b) => b.id - a.id);

  const transactionsToDisplay = permitted
    ? sortedTransactions.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      )
    : sortedTransactions.slice(0, 3);

  const handleUserChange = (email: string) => {
    const user = allUsers.data.find((user) => user.email === email);
    if (user) {
      setSelectedUser(user.key);
      setSelectedUserEmail(user.email);
      setSelectedTenant(null);
      setTransferAmount("");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
  ];

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
          <Table
            columns={columns}
            dataSource={transactionsToDisplay.map((transaction) => ({
              ...transaction,
              key: transaction.id,
            }))}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: sortedTransactions.length,
              onChange: (page) => setCurrentPage(page),
            }}
          />
        </div>
        <div className="flex gap-2">
          {permitted ? (
            <>
              <Button type="primary" onClick={handleOpenWireTransferModal}>
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
            <Select
              className="w-full mb-4"
              onChange={handleUserChange}
              placeholder="Select User"
            >
              {allUsers.data
                .filter((user) => user.email !== currentUserEmail)
                .map((user) => (
                  <Option key={user.key} value={user.email}>
                    {user.email}
                  </Option>
                ))}
            </Select>

            {selectedUser && (
              <Select
                className="w-full mb-4"
                placeholder="Select Tenant"
                onChange={(value) => setSelectedTenant(value)}
              >
                {userTenants.map((tenant) => {
                  if (tenant.key === currentTenant) {
                    if (userTenants.length === 1) {
                      return null;
                    }
                  } else {
                    return (
                      <Option key={tenant.key} value={tenant.key}>
                        {tenant.name}
                      </Option>
                    );
                  }
                })}
              </Select>
            )}

            {selectedTenant && (
              <Input
                type="number"
                placeholder="Amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full mb-4 p-2 border border-gray-300 rounded"
              />
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseWireTransfer}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleWireTransferSubmit}
                disabled={!selectedUser || !selectedTenant || !transferAmount}
              >
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
          Only Account Owners can send wire transfers over $1,000 USD.
        </Paragraph>
      </Modal>
    </div>
  );
};

export default Profile;
