import { Button, Input, Select } from "antd";
import FormItemLabel from "antd/es/form/FormItemLabel";
import { Option } from "antd/es/mentions";
import { TenantRead } from "permitio";
import { FC, useCallback, useEffect, useState } from "react";

type WireTransferFormProps = {
    handleWireTransferSubmit: (account: string, amount: number, description: string, otp: number) => Promise<void>;
    tenants: TenantRead[];
    visible: boolean;
    strongAuthForm: boolean;
};

const WireTransferForm: FC<WireTransferFormProps> = ({ tenants, handleWireTransferSubmit, visible, strongAuthForm }) => {
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [transferAmount, setTransferAmount] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [otp, setOtp] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setSelectedUser("");
        setTransferAmount(0);
        setDescription("");
        setOtp(0);
    }, [visible]);

    const submit = useCallback(async () => {
        setLoading(true);
        await handleWireTransferSubmit(selectedUser, transferAmount, description, otp);
        setLoading(false);
    }, [selectedUser, transferAmount, description, handleWireTransferSubmit, otp]);

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

            {strongAuthForm && (
                <div className="mb-4">
                    <p className="mb-2">We just emailed you a one time password required to complete this transaction.</p>
                    <Input
                        placeholder="Enter password here"
                        type="number"
                        value={otp}
                        onChange={(e) => setOtp(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
            )}

            <div className="flex justify-end gap-2">
                <Button
                    type="primary"
                    onClick={submit}
                    disabled={!selectedUser || !transferAmount || !description || loading || (strongAuthForm && !otp)}
                >
                    Send
                </Button>
            </div>
        </>
    )
}

export default WireTransferForm;