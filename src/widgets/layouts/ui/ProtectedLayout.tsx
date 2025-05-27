"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Layout, Button, Typography, Spin } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text } = Typography;

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff',
                padding: '0 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
                <Text style={{ fontSize: 16 }}>
                    Welcome, {session?.user?.email}
                </Text>
                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    Sign Out
                </Button>
            </Header>
            <Content style={{
                padding: '24px',
                margin: '24px',
                background: '#f0f2f5'
            }}>
                {children}
            </Content>
        </Layout>
    );
} 