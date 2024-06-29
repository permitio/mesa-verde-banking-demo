"use client";

import React, { useState, useEffect } from "react";
import { useStytchSession, useStytchUser } from "@stytch/nextjs";
import { useAccount } from "@/src/components/AccountContext";
import RequestAccess from "./RequestAccess";
import UserManagement from "./UserManagement";
import { Permit } from "permitio";
import {
  Button,
  Select,
  Spin,
  Modal,
  Table,
  Typography,
  Input,
  notification,
} from "antd";
import { getCookies } from "../../lib/fetchCookies";
import { checkIfWithinLast30Seconds } from "../../lib/checkFirstTimeLogin";
import mockData, { AccountData, SavingsAccountData } from "../../lib/mockData";

const { Option } = Select;
const { Title, Paragraph } = Typography;

const permit = new Permit({
  token: process.env.NEXT_PUBLIC_PERMIT_API_KEY,
  pdp: "http://localhost:7766",
});

type Tenant = {
  id: string;
  key: string;
  name: string;
};

const Profile: React.FC = () => {
  const { user } = useStytchUser();
  const { session } = useStytchSession();
  const { currentTenant, allUsers } = useAccount();
  const [showWireTransfer, setShowWireTransfer] = useState(false);
  const [showReviewRequests, setShowReviewRequests] = useState(false);
  const [showRestrictedAccessModal, setShowRestrictedAccessModal] =
    useState(false);
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [showOverAmountModal, setShowOverAmountModal] = useState(false);
  const [showPermissionDeniedModal, setShowPermissionDeniedModal] =
    useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("Admin");
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [permitted, setPermitted] = useState<boolean | null>(null);
  const [wireTransferPermitted, setWireTransferPermitted] = useState<
    boolean | null
  >(null);
  const [reviewRequestsPermitted, setReviewRequestsPermitted] = useState<
    boolean | null
  >(null);
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
    null,
  );
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const currentUserEmail = user?.emails?.[0]?.email ?? "";

  const createUserAndAssignRole = async (userId: string, userEmail: string) => {
    const response = await fetch("../profile/api/syncUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, userEmail }),
    });

    if (response.ok) {
      const data = await response.json();
      const currentAccountData = JSON.parse(
        localStorage.getItem("accountData") || "{}",
      );
      const updatedAccountData = { ...currentAccountData, ...data.mockData };
      localStorage.setItem("accountData", JSON.stringify(updatedAccountData));
      window.location.reload();
    } else {
      const errorData = await response.json();
      console.error("Error:", errorData.error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const timestamp = user?.created_at ?? "";
      const isWithinLast30Seconds = checkIfWithinLast30Seconds(timestamp);

      console.log(
        `The provided timestamp is within the last 30 seconds: ${isWithinLast30Seconds}`,
      );

      if (isWithinLast30Seconds && user) {
        await createUserAndAssignRole(
          user.user_id,
          user.emails?.[0]?.email || "",
        );
      }

      if (user) {
        const tenants = await (
          await fetch(`../profile/api/tenants?id=${user.user_id}`)
        ).json();
        setUserTenants(tenants);
      }
    };

    if (user && session) {
      fetchData();
    }
  }, [user, session]);

  useEffect(() => {
    const timestamp = user?.created_at ?? "";
    const isWithinLast30Seconds = checkIfWithinLast30Seconds(timestamp);

    const fetchUserTenants = async () => {
      if (!isWithinLast30Seconds) {
        if (selectedUser) {
          try {
            const response = await fetch(
              `../profile/api/tenants?id=${selectedUser}`,
            );
            const data = await response.json();

            console.log("PROFILE USER TENANTS: ", data);
            setUserTenants(data);
          } catch (error) {
            console.error("Error fetching user tenants:", error);
          }
        }
      }
    };

    fetchUserTenants();
  }, [selectedUser]);

  useEffect(() => {
    if (!localStorage.getItem("accountData")) {
      localStorage.setItem("accountData", JSON.stringify(mockData));
    }
  }, []);

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

  const handleClosePermissionDenied = () => {
    setShowPermissionDeniedModal(false);
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
      console.log(data);
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
          tenant: currentTenant,
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
    const user = allUsers.find((user) => user.email === email);
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
            Currently logged in as: {user?.emails?.[0]?.email ?? "Unknown User"}
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
              {allUsers
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
        title="Permission Denied"
        visible={showPermissionDeniedModal}
        onCancel={handleClosePermissionDenied}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={handleClosePermissionDenied}
          >
            Close
          </Button>,
        ]}
        width={400}
      >
        <Paragraph>
          Only account owners can invite other users to their accounts.
        </Paragraph>
      </Modal>

      <Modal
        title="Review User Requests & Wire Transfers"
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
