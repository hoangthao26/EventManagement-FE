"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import Loading from "@/shared/ui/Loading";
import { Card, Typography, Button, Space } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function MyEventDetailPage({ params }: { params: { id: string } }) {
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
    const event = {
        id: params.id,
        title: "Workshop React",
        description: "Learn React basics",
        date: "2024-03-20",
        location: "Room 101",
        status: "upcoming"
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4">
                <Button onClick={() => router.back()}>Back</Button>
                <Card className="mt-4">
                    <Title level={2}>{event.title}</Title>
                    <Paragraph>{event.description}</Paragraph>
                    <p>Date: {event.date}</p>
                    <p>Location: {event.location}</p>
                    <p>Status: {event.status}</p>
                    <Space className="mt-4">
                        <Button type="primary" danger onClick={() => {
                            // Handle cancel registration
                            console.log("Cancel registration for event:", event.id);
                        }}>
                            Cancel Registration
                        </Button>
                    </Space>
                </Card>
            </div>
        </DashboardLayout>
    );
}