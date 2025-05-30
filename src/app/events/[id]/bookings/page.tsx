"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";

import Loading from "@/shared/ui/Loading";
import { Typography, Form, Input, Button, Card, message } from "antd";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function EventBookingPage({ params }: { params: { id: string } }) {
    const { session, status } = useAuth();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
        }
        // Fetch event details
        // Mock data - sẽ thay thế bằng API call thực tế
        setEvent({
            id: params.id,
            title: "Workshop React",
            description: "Learn React basics",
            date: "2024-03-20",
            location: "Room 101"
        });
        setLoading(false);
    }, [params.id, status]);

    const onFinish = async (values: any) => {
        try {
            // Call API to register for event
            console.log("Registering for event:", values);
            message.success("Registration successful!");
            router.push("/my-events");
        } catch (error) {
            message.error("Registration failed. Please try again.");
        }
    };

    if (status === "loading" || loading) {
        return <Loading />;
    }

    if (!event) {
        return <div>Event not found</div>;
    }

    return (

        <div className="container mx-auto p-4">
            <Title level={2}>Register for {event.title}</Title>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        name: session?.user?.name,
                        email: session?.user?.email
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: "Please input your name!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please input your email!" },
                            { type: "email", message: "Please enter a valid email!" }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: "Please input your phone number!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Why do you want to attend this event?"
                        rules={[{ required: true, message: "Please tell us why you want to attend!" }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Register
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>

    );
}