"use client";

import { Button, Typography, Layout, Space, Result } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/model/useAuth";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Content } = Layout;

export default function UnauthorizedPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <Layout style={{
            height: "100vh",
            overflow: "hidden",
            position: "fixed",
            width: "100%",
            top: 0,
            left: 0
        }}>
            <Content style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f0f2f5",
                height: "100%"
            }}>
                <Result
                    status="403"
                    title="403"
                    subTitle="Sorry, you are not authorized to access this page."
                    extra={[
                        <Button
                            type="primary"
                            key="back"
                            onClick={handleBack}
                            icon={<ArrowLeftOutlined />}
                            style={{
                                height: "45px",
                                fontSize: "16px",
                                fontWeight: "600",
                                padding: "0 30px"
                            }}
                        >
                            Go Back
                        </Button>
                    ]}
                />
            </Content>
        </Layout>
    );
} 