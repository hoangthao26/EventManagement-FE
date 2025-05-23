"use client";

import { Button, Card, Typography, Space } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useAuth } from "../model/useAuth";

const { Title, Text } = Typography;

export const LoginForm = () => {
    const { login } = useAuth();

    const handleLogin = async () => {
        await login();
    };

    return (
        <Card
            style={{
                width: 450,
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                borderRadius: "12px"
            }}
            variant="borderless"
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }} align="center">
                <Space direction="vertical" align="center" style={{ width: "100%" }}>
                    <Title level={2} style={{ margin: 0 }}>Event Management</Title>
                </Space>

                <Button
                    type="primary"
                    size="large"
                    onClick={handleLogin}
                    icon={<GoogleOutlined style={{ fontSize: '20px' }} />}
                    style={{
                        width: "100%",
                        height: "45px",
                        fontSize: "16px",
                        fontWeight: "600",
                        maxWidth: "450px"
                    }}
                >
                    Sign in with Google
                </Button>

                <Text type="secondary">
                    Please use your FPT email (@fpt.edu.vn) to sign in
                </Text>
            </Space>
        </Card>
    );
}; 