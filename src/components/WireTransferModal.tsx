import { Alert, Button, Input, Modal, Select, Skeleton } from "antd";
import { FC, use, useCallback, useEffect, useState } from "react";
import RequestAccess from "./RequestAccess";
import { Option } from "antd/es/mentions";
import { useAccount } from "./AccountContext";
import { useStytchUser } from "@stytch/nextjs";
import { Transaction } from "@/lib/Model";
import { TenantRead } from "permitio";
import WireTransferForm from "./WireTransferForm";
import OperationApprovalRequest from "./OperationApprovalRequest";

type WireTransferModalProps = {
    visible: boolean;
    onCancel: () => void;
};

enum TransferStatus {
    ACTIVE = "ACTIVE",
    SUCCESS = "SUCCESS",
    NEED_APPROVAL = "NEED_APPROVAL",
    FAIL = "FAIL",
    NEED_STRONG_AUTH = "NEED_STRONG_AUTH",
}

const WireTrasferModal: FC<WireTransferModalProps> = ({ visible, onCancel }) => {
    const { currentTenant } = useAccount();
    const [tenants, setTenants] = useState<TenantRead[]>([]);
    const [awaitingTransferKey, setAwaitingTransferKey] = useState<string | null>(null);
    const [transferStatus, setTransferStatus] = useState<TransferStatus | null>(TransferStatus.ACTIVE);

    useEffect(() => {
        setTransferStatus(TransferStatus.ACTIVE);
    }, [visible]);

    useEffect(() => {
        const fetchTenants = async () => {
            const response = await fetch(`/account/api/tenants/all`);
            const data = await response.json() as TenantRead[];
            setTenants(data.filter((tenant) => tenant.key !== currentTenant && tenant.key !== "default"));
        }
        fetchTenants();
    }, [currentTenant]);

    const handleWireTransferSubmit: (to: string, amount: number, description: string) => void = useCallback(async (to, amount, description) => {
        const transaction: Transaction = {
            id: new Date().getTime() + "-" + Math.floor(Math.random() * 1000),
            date: new Date().toISOString(),
            description,
            amount,
            currency: "£",
        };
        try {
            const response = await fetch(`/account/api/transactions?tenant=${currentTenant}`, {
                method: "POST",
                body: JSON.stringify({
                    to,
                    transaction
                }),
            });
            const status = response.status;
            const data = await response.json();
            if (status === 403 && data?.message === "Wire transfer needs approval") {
                setAwaitingTransferKey(data.transfer);
                setTransferStatus(TransferStatus.NEED_APPROVAL);
                return;
            } else if (status === 403 && data.message === "Wire transfer needs strong authentication") {
                setAwaitingTransferKey(data.transfer);
                setTransferStatus(TransferStatus.NEED_STRONG_AUTH);
                return;
            } else if (status !== 200) {
                setTransferStatus(TransferStatus.FAIL);
                return;
            }
            setTransferStatus(TransferStatus.SUCCESS);
        } catch (error) {
            console.warn("Error sending wire transfer: ", error);
            setTransferStatus(TransferStatus.FAIL);
        }
    }, [currentTenant]);


    return (<Modal
        title="Send Wire Transfer"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        styles={{ body: { height: "calc(100vh - 400px)", overflowY: "auto" } }}
    >
        {!tenants.length && <Skeleton active className="!w-full" />}
        {tenants.length > 0 &&
            <>
                {transferStatus === TransferStatus.ACTIVE &&
                    <WireTransferForm tenants={tenants} handleWireTransferSubmit={handleWireTransferSubmit} visible={visible} />
                }
                {transferStatus === TransferStatus.NEED_APPROVAL && awaitingTransferKey &&
                    <OperationApprovalRequest transferKey={awaitingTransferKey} currentTenant={currentTenant} />
                }
                {transferStatus === TransferStatus.NEED_STRONG_AUTH &&
                    <>Strong your authentication</>
                }
                {transferStatus === TransferStatus.SUCCESS &&
                    <Alert message="Transfer Successful" type="success" />
                }
                {transferStatus === TransferStatus.FAIL &&
                    <Alert message="Transfer Failed" type="error" />
                }
            </>
        }
    </Modal>)

};

export default WireTrasferModal;