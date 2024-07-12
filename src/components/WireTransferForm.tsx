import { Button, Input, Select } from "antd";
import { Option } from "antd/es/mentions";
import { TenantRead } from "permitio";
import { FC, useEffect, useState } from "react";

type WireTransferFormProps = {
    handleWireTransferSubmit: (account: string, amount: number, description: string) => void;
    tenants: TenantRead[];
    visible: boolean;
};

const WireTransferForm: FC<WireTransferFormProps> = ({ tenants, handleWireTransferSubmit, visible }) => {
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [transferAmount, setTransferAmount] = useState<number>(0);
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        setSelectedUser("");
        setTransferAmount(0);
        setDescription("");
    }, [visible]);

    return (
        <>
            <Select
                className="w-full mb-4"
                onChange={(value) => setSelectedUser(value)}
                placeholder="Select Account"
            >
                {tenants
                    .map(({ key, name }) => (
                        <Option key={key} value={key}>
                            {name}
                        </Option>
                    ))}
            </Select>

            {
                selectedUser && (
                    <>
                        <Input
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                        />

                        <Input
                            type="number"
                            placeholder="Amount"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(parseInt(e.target.value))}
                            className="w-full mb-4 p-2 border border-gray-300 rounded"
                        />
                    </>
                )
            }

            <div className="flex justify-end gap-2">
                <Button
                    type="primary"
                    onClick={() => handleWireTransferSubmit(selectedUser, transferAmount, description)}
                    disabled={!selectedUser || !transferAmount || !description}
                >
                    Send
                </Button>
            </div>
        </>
    )
}

export default WireTransferForm;