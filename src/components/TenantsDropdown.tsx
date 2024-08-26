import { FC, useEffect, useState } from "react";
import { useAccount } from "./AccountContext";
import { Select, Skeleton, Spin } from "antd";
import { Option } from "antd/es/mentions";

const TenantsDropdown: FC = () => {
    const { tenants, currentTenant, handleTenantChange } = useAccount();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenants.length > 0) {
            setLoading(false);
        }
    }, [tenants]);

    const handleChange = (value: string) => {
        handleTenantChange(value);
    };

    return (
        <div>
            {loading ? (
                <Skeleton.Input className="!w-full" />
            ) : (
                <>
                    <span className="text-lg">Account:</span>
                    <Select
                        value={currentTenant}
                        onChange={handleChange}
                        className="account-switcher !w-full"
                        style={{ width: 200 }}
                        disabled={tenants.length === 1}
                    >
                        {tenants.length === 0 ? (
                            <Option value="">No tenants available</Option>
                        ) : (
                            tenants.map((tenant: { key: string; name: string }) => (
                                <Option key={tenant.key} value={tenant.key}>
                                    {tenant.name}
                                </Option>
                            ))
                        )}
                    </Select>
                </>
            )}
        </div>
    )
};

export default TenantsDropdown;