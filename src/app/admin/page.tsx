"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import Loading from "@/shared/ui/Loading";
import { Card, Typography, Row, Col, Statistic } from "antd";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function AdminDashboardPage() {
    const { session, status } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
        }
    }, [status]);

    if (status === "loading") {
        return <Loading />;
    }

    // Mock data - sẽ thay thế bằng API call thực tế
    const stats = {
        totalEvents: 10,
        activeEvents: 5,
        totalUsers: 100,
        totalRegistrations: 250
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4">
                <Title level={2}>Admin Dashboard</Title>
                <Row gutter={[16, 16]} className="mt-4">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Total Events" value={stats.totalEvents} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Active Events" value={stats.activeEvents} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Total Users" value={stats.totalUsers} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Total Registrations" value={stats.totalRegistrations} />
                        </Card>
                    </Col>
                </Row>
            </div>
        </DashboardLayout>
    );
}