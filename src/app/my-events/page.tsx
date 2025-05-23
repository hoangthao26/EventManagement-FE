"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import Loading from "@/components/Loading";
import { Card, Typography, Row, Col, Button } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function MyEventsPage() {
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
    const events = [
        {
            id: 1,
            title: "Workshop React",
            description: "Learn React basics",
            date: "2024-03-20",
            location: "Room 101",
            status: "upcoming"
        },
        // Thêm các events khác...
    ];

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4">
                <Title level={2}>My Events</Title>
                <Row gutter={[16, 16]}>
                    {events.map((event) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                            <Card
                                hoverable
                                title={event.title}
                                onClick={() => router.push(`/my-events/${event.id}`)}
                            >
                                <Paragraph>{event.description}</Paragraph>
                                <p>Date: {event.date}</p>
                                <p>Location: {event.location}</p>
                                <p>Status: {event.status}</p>
                                <Button
                                    type="primary"
                                    block
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        router.push(`/my-events/${event.id}`);
                                    }}
                                >
                                    View Details
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </DashboardLayout>
    );
}