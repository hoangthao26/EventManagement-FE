'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Button, Tag, Space, Table } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import Loading from '@/shared/ui/Loading';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Event {
    id: string;
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    registeredCount: number;
    capacity: {
        student: number;
        lecturer: number;
    };
}

export default function MyEventsPage() {
    const router = useRouter();
    const { session, status } = useAuth();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
        }
        // TODO: Fetch events from API
        // Mock data for now
        setEvents([
            {
                id: '1',
                title: 'Workshop React',
                type: 'WORKSHOP',
                startTime: '2024-03-20T09:00:00',
                endTime: '2024-03-20T17:00:00',
                status: 'PUBLISHED',
                registeredCount: 30,
                capacity: {
                    student: 50,
                    lecturer: 5
                }
            },
            // Add more mock events...
        ]);
        setLoading(false);
    }, [status]);

    if (status === "loading" || loading) {
        return <Loading />;
    }

    const getStatusColor = (status: Event['status']) => {
        switch (status) {
            case 'DRAFT':
                return 'default';
            case 'PUBLISHED':
                return 'processing';
            case 'ONGOING':
                return 'success';
            case 'COMPLETED':
                return 'default';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    const columns = [
        {
            title: 'Event Name',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Event) => (
                <a onClick={() => router.push(`/organizer/events/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: Event['status']) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Registration',
            key: 'registration',
            render: (record: Event) => (
                <span>
                    {record.registeredCount} / {record.capacity.student + record.capacity.lecturer}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Event) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => router.push(`/organizer/events/${record.id}`)}
                    >
                        View
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => router.push(`/organizer/events/${record.id}/edit`)}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            // TODO: Implement delete functionality
                            console.log('Delete event:', record.id);
                        }}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const hasHeadRole = session?.user?.userDepartmentRoles?.some(
        role => role.roleName === 'HEAD'
    );

    return (
        <DashboardLayout>
            <div style={{ padding: '24px' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={2}>My Events</Title>
                    </Col>
                    <Col>
                        {hasHeadRole && (
                            <Button
                                type="primary"
                                onClick={() => router.push('/organizer/create')}
                            >
                                Create New Event
                            </Button>
                        )}
                    </Col>
                </Row>

                <Card>
                    <Table
                        columns={columns}
                        dataSource={events}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total: number) => `Total ${total} events`,
                        }}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
} 