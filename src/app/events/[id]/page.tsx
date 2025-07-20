"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Card, Space, Tag, Button, notification, Image, Descriptions, Row, Col, Statistic, Result, Modal } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, TeamOutlined, CheckCircleOutlined, CalendarOutlined, ShareAltOutlined, HomeOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Loading from '@/shared/ui/Loading';
import { useAuth } from '@/features/auth/model/useAuth';
import HomeLayout from "@/widgets/layouts/ui/HomeLayout";
import axiosInstance from '@/shared/lib/axios';

const { Title, Text, Paragraph } = Typography;

interface EventTag {
    id: number;
    name: string;
    description: string;
}

interface EventImage {
    id: number;
    url: string;
}

interface EventDetail {
    id: number;
    name: string;
    description: string;
    status: string;
    departmentAvatarUrl: string;
    departmentName: string;
    typeName: string;
    audience: 'STUDENT' | 'LECTURER' | 'BOTH';
    maxCapacity: number;
    registeredCount: number;
    maxCapacityStudent: number | null;
    registeredCountStudent: number | null;
    maxCapacityLecturer: number | null;
    registeredCountLecturer: number | null;
    locationAddress: string;
    locationAddress2: string;
    startTime: string;
    endTime: string;
    registrationStart: string;
    registrationEnd: string;
    posterUrl: string;
    bannerUrl: string;
    mode: 'ONLINE' | 'OFFLINE';
    platformName?: string;
    tags: EventTag[];
    images: EventImage[];
    createdAt: string;
    updatedAt: string;
    isRegistered: boolean;
    registrationStatus: string | null;
}

interface RegistrationRequest {
    email: string;
    name: string;
    eventId: number;
    checkinUrl: string;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { session, status } = useAuth();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [eventId, setEventId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setEventId(resolvedParams.id);
        };

        getParams();
    }, [params]);

    useEffect(() => {
        if (!eventId) return;        const fetchEventDetail = async () => {
            try {
                const response = await axiosInstance.get<EventDetail>(`/events/${eventId}`);
                setEvent(response.data);
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: 'Failed to fetch event details',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetail();
    }, [eventId]); // <-- Only depend on eventId

    const handleRegister = async () => {
        if (!eventId || !event || !session?.user) return;
        

        setRegistering(true);
        try {
            // Create registration request
            const registrationData: RegistrationRequest = {
                email: session.user.email || '',
                name: session.user.name || '',
                eventId: event.id,
                checkinUrl: ''
            };            // Call registration API
            await axiosInstance.post('/registrations', registrationData);

            notification.success({
                message: 'Success',
                description: 'Successfully registered for the event',
            });

            // Refresh event data
            const response = await axiosInstance.get<EventDetail>(`/events/${eventId}`);
            setEvent(response.data);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Registration error:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to register for the event',
            });
        } finally {
            setRegistering(false);
        }
    };

    const showConfirmModal = () => {
        if (!event) return;
        setIsModalOpen(true);
    };    const getRegistrationButtonProps = (status: string | null, isRegistering: boolean, isOpen: boolean) => {
        if (!isOpen) {
            return {
                disabled: true,
                children: new Date() < new Date(event?.registrationStart || '') ? 'Chưa mở đăng ký' : 'Đã đóng đăng ký'
            };
        }
        switch (status) {
            case 'REGISTERED':
                return {
                    disabled: true,
                    icon: <CheckCircleOutlined />,
                    children: 'Đã đăng ký'
                };
            case 'CANCELED':
                return {
                    disabled: true,
                    children: 'Đã hủy đăng ký'
                };
            case 'ATTENDED':
                return {
                    disabled: true,
                    icon: <CheckCircleOutlined />,
                    children: 'Đã tham gia'
                };
            default:
                return {
                    disabled: isRegistering,
                    children: isRegistering ? 'Đang đăng ký...' : 'Đăng ký ngay'
                };
        }
    };

    if (loading || !eventId) {
        return <Loading />;
    }

    if (!event) {
        return (
            <HomeLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Result
                        status="404"
                        title={<Title level={1} style={{ fontSize: '64px' }}>404</Title>}
                        subTitle={
                            <div className="text-center">
                                <Title level={3}>Trang không tồn tại</Title>
                                <Text type="secondary">
                                    Trang bạn đang tìm kiếm không tồn tại!
                                </Text>
                            </div>
                        }
                        extra={
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Space wrap>
                                    <Button
                                        type="primary"
                                        icon={<HomeOutlined />}
                                        onClick={() => router.push('/')}
                                    >
                                        Về trang chủ
                                    </Button>
                                    <Button
                                        icon={<SearchOutlined />}
                                        onClick={() => router.push('/events')}
                                    >
                                        Các sự kiện
                                    </Button>
                                    <Button
                                        type="text"
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() => router.back()}
                                    >
                                        Quay lại
                                    </Button>
                                </Space>
                            </Space>
                        }
                    />
                </div>
            </HomeLayout>
        );
    }

    const isRegistrationOpen = new Date() >= new Date(event.registrationStart) &&
        new Date() <= new Date(event.registrationEnd);

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Banner */}
                <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
                    <Image
                        src={event.bannerUrl}
                        alt={event.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview={false}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '2rem',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                    }}>
                        <div className="container mx-auto">
                            <Title level={1} style={{ color: 'white', margin: 0 }}>{event.name}</Title>
                            <Space size={[0, 8]} wrap>
                                <Tag color="blue">{event.typeName}</Tag>
                                <Tag color="green">{event.mode}</Tag>

                            </Space>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto py-8 px-4">
                    <Row gutter={[32, 32]}>
                        {/* Main Content */}
                        <Col xs={24} lg={16}>
                            <Card className="mb-6">
                                <Title level={3}>About the Event</Title>
                                <Paragraph>{event.description}</Paragraph>
                            </Card>
                        </Col>

                        {/* Sidebar */}
                        <Col xs={24} lg={8}>
                            <Card className="mb-6">
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <Descriptions column={1}>
                                        <Descriptions.Item label={<><ClockCircleOutlined /> Time</>}>
                                            {format(new Date(event.startTime), 'PPp')} -
                                            {format(new Date(event.endTime), 'PPp')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<><EnvironmentOutlined /> Location</>}>
                                            {event.mode === 'ONLINE' ? (
                                                <>{event.platformName}</>
                                            ) : (
                                                <>{event.locationAddress}<br />{event.locationAddress2}</>
                                            )}
                                        </Descriptions.Item>
                                    </Descriptions>

                                    <div>
                                        <Title level={5}>Registration Period</Title>
                                        <Text>
                                            <CalendarOutlined /> {format(new Date(event.registrationStart), 'PP')} -
                                            {format(new Date(event.registrationEnd), 'PP')}
                                        </Text>
                                    </div>

                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Statistic
                                            title="Total Registered"
                                            value={event.registeredCount}
                                            suffix={`/ ${event.maxCapacity}`}
                                        />
                                    </Space>

                                    {/* Update the register button to show modal */}
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        onClick={showConfirmModal}
                                        {...getRegistrationButtonProps(event.registrationStatus, registering, isRegistrationOpen)}
                                    />

                                    {/* Add confirmation modal */}
                                    <Modal
                                        title="Xác nhận đăng ký"
                                        open={isModalOpen}
                                        onOk={handleRegister}
                                        onCancel={() => setIsModalOpen(false)}
                                        confirmLoading={registering}
                                        okText="Xác nhận"
                                        cancelText="Hủy"
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Title level={4}>{event?.name}</Title>
                                            <Descriptions column={1}>
                                                <Descriptions.Item label="Thời gian">
                                                    {format(new Date(event?.startTime || ''), 'PPp')} -
                                                    {format(new Date(event?.endTime || ''), 'PPp')}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Địa điểm">
                                                    {event?.mode === 'ONLINE'
                                                        ? event?.platformName
                                                        : `${event?.locationAddress} ${event?.locationAddress2}`}
                                                </Descriptions.Item>
                                            </Descriptions>
                                            <Paragraph>
                                                Bạn có chắc chắn muốn đăng ký tham gia sự kiện này?
                                            </Paragraph>
                                        </Space>
                                    </Modal>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </HomeLayout>
    );
}