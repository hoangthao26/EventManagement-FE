"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import { useRouter } from "next/navigation";
import { Layout } from "antd";
import { LoginForm } from "@/features/auth/ui/LoginForm";
import Loading from "@/shared/ui/Loading";

const { Content } = Layout;

export default function LoginPage() {
    const { session, status, redirectBasedOnRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Nếu đã đăng nhập, chuyển hướng dựa trên role
        if (status === "authenticated" && session?.user?.roles) {
            redirectBasedOnRole();
        }
    }, [status, session, redirectBasedOnRole]);

    if (status === "loading") {
        return <Loading />;
    }

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
                <LoginForm />
            </Content>
        </Layout>
    );
} 