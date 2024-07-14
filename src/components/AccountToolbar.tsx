import { useStytch } from "@stytch/nextjs";
import { Button, Modal } from "antd";
import { FC, useState } from "react";
import { useAccount } from "./AccountContext";
import UserManagement from "./UserManagement";
import WireTrasferModal from "./WireTransferModal";
import { useAuthorization } from "./AbilityContext";
import RequestAccess from "./RequestAccess";
import OperationApprovalList from "./OperationApprovalList";

enum ModalType {
    WIRE_TRANSFER = "WIRE_TRANSFER",
    ACCESS_REQUEST = "ACCESS_REQUEST",
    USER_MANAGEMENT = "USER_MANAGEMENT",
    APPROVAL_LIST = "APPROVAL_LIST",
}

const AccountToolbar: FC = () => {
    const [activeModal, setActiveModal] = useState<ModalType | null>(null);
    const { currentTenant, userJwt } = useAccount();
    const { abilities } = useAuthorization();

    return (
        <div className="gap-4 flex">
            {abilities?.CREATE_WIRE_TRANSFER && (
                <Button type="primary" onClick={() => (setActiveModal(ModalType.WIRE_TRANSFER))}>
                    Send Wire Transfer
                </Button>
            )}
            {abilities?.ADD_MEMBERS && (
                <Button type="default" onClick={() => (setActiveModal(ModalType.USER_MANAGEMENT))} disabled={!userJwt}>
                    Manage Account Users
                </Button>
            )}
            {abilities && !abilities.LIST_TRANSACTIONS && (
                <Button type="primary" onClick={() => (setActiveModal(ModalType.ACCESS_REQUEST))}>
                    Request Access to Transactions
                </Button>
            )}
            {abilities?.APPROVE_WIRE_TRANSFER && (
                <Button type="primary" onClick={() => (setActiveModal(ModalType.APPROVAL_LIST))}>
                    Review Wire Transfers
                </Button>
            )}
            <Modal
                title="Review Wire Transfers"
                open={activeModal === ModalType.APPROVAL_LIST}
                onCancel={() => setActiveModal(null)}
                footer={null}
                width={1200}
                styles={{
                    body: { height: "calc(100vh)", overflowY: "auto" }
                }}
            >
                <OperationApprovalList currentTenant={currentTenant} />
            </Modal>
            <Modal
                title="Manage Account Users and Review Requests"
                open={activeModal === ModalType.USER_MANAGEMENT}
                onCancel={() => setActiveModal(null)}
                footer={null}
                width={700}
                styles={{
                    body: { height: "calc(100vh - 200px)", overflowY: "auto" }
                }}
            >
                {activeModal === ModalType.USER_MANAGEMENT && (
                    <UserManagement
                        currentTenant={currentTenant}
                    />
                )}
            </Modal>
            <Modal
                title="Request Access to Account"
                open={activeModal === ModalType.ACCESS_REQUEST}
                onCancel={() => setActiveModal(null)}
                footer={null}
                width={700}
                styles={{
                    body: { height: "calc(100vh - 200px)", overflowY: "auto" }
                }}
            >
                <RequestAccess
                    currentTenant={currentTenant}
                />
            </Modal>
            <WireTrasferModal visible={activeModal === ModalType.WIRE_TRANSFER} onCancel={() => setActiveModal(null)} />
        </div>
    );
}

export default AccountToolbar;