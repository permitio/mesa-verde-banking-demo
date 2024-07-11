import { Button, Input, Modal, Select } from "antd";
import { FC, useCallback, useState } from "react";
import RequestAccess from "./RequestAccess";
import { Option } from "antd/es/mentions";
import { useAccount } from "./AccountContext";
import { useStytchUser } from "@stytch/nextjs";

type WireTransferModalProps = {
    visible: boolean;
    onCancel: () => void;
};

const WireTrasferModal: FC<WireTransferModalProps> = ({ visible, onCancel }) => {
    const { user: currentUser } = useStytchUser();
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [transferAmount, setTransferAmount] = useState<string>("");
    const [wireTransferPermitted, setWireTransferPermitted] = useState<boolean | null>(null);

    const { currentTenant, allUsers, userJwt } = useAccount();

    const handleWireTransferSubmit: () => void = useCallback(async () => {
        console.log("SENDING WIRE TRANSFER TO: ", selectedUser, " AMOUNT: ", transferAmount);
    }, [selectedUser, transferAmount]);


    return (<Modal
        title="Send Wire Transfer"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        styles={{ body: { height: "calc(100vh - 400px)", overflowY: "auto" } }}
    >
        <>
            <Select
                className="w-full mb-4"
                onChange={(value) => setSelectedUser(value)}
                placeholder="Select User"
            >
                {allUsers
                    .filter((user) => user.key !== currentUser?.user_id)
                    .map((user) => (
                        <Option key={user.key} value={user.email}>
                            {user.email}
                        </Option>
                    ))}
            </Select>

            {selectedUser && (
                <Input
                    type="number"
                    placeholder="Amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
            )}

            <div className="flex justify-end gap-2">
                <Button onClick={onCancel}>Cancel</Button>
                <Button
                    type="primary"
                    onClick={handleWireTransferSubmit}
                    disabled={!selectedUser || !transferAmount}
                >
                    Send
                </Button>
            </div>
        </>
    </Modal>)

};

export default WireTrasferModal;