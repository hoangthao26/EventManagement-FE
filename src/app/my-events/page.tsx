"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import { useApi } from "@/lib/useApi";
import Loading from "@/shared/ui/Loading";
import { Card, Typography, Row, Col, Input, Select, Empty, Tag, Space, Button, notification, Modal, Descriptions } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, ClearOutlined } from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import HomeLayout from "@/widgets/layouts/ui/HomeLayout";
import { DatePicker } from 'antd';
import moment from "moment";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Search } = Input;

interface RegisteredEvent {
    id: number;
    name: string;
    description: string;
    locationAddress: string;
    locationAddress2: string;
    startTime: string;
    endTime: string;
    mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
    posterUrl: string;
    registrationStatus: string;
    typeName: string;
    departmentName: string;
}

type EventMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export default function MyEventsPage() {
    const { session, status } = useAuth();
    const router = useRouter();
    const { apiCall } = useApi();
    const [allEvents, setAllEvents] = useState<RegisteredEvent[]>([]);
    const [filteredEvents, setFiltereredEvents] = useState<RegisteredEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
    const [mode, setMode] = useState<EventMode | null>(null);

    useEffect(() => {
        let isSubscribed = true;

        const fetchRegisteredEvents = async () => {
            try {
                const data = await apiCall<RegisteredEvent[]>('/events/registered');
                if (isSubscribed) {
                    setAllEvents(data);
                    setFiltereredEvents(data);
                }
            } catch (error) {
                if (isSubscribed) {
                    notification.error({
                        message: 'Error',
                        description: 'Failed to fetch registered events'
                    });
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        };

        if (status === "authenticated") {
            fetchRegisteredEvents();
        }

        return () => {
            isSubscribed = false;
        };
    }, [status]);

    // Client-side filtering
    useEffect(() => {
        let result = [...allEvents];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(event =>
                event.name.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term)
            );
        }

        // Filter by mode
        if (mode !== null) {
            result = result.filter(event => event.mode === mode);
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
            const [start, end] = dateRange;
            result = result.filter(event => {
                const eventDate = moment(event.startTime);
                return eventDate.isBetween(start, end, 'day', '[]');
            });
        }

        setFiltereredEvents(result);
    }, [allEvents, searchTerm, mode, dateRange]);

    const getEventTypeTag = (type: string) => {
        const typeColors: Record<string, string> = {
            'Seminar': 'blue',
            'Workshop': 'purple',
            'Orientation': 'green',
            'Other': 'default'
        };

        return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
    };

    const getModeTag = (mode: 'ONLINE' | 'OFFLINE' | 'HYBRID') => {
        const modeColors = {
            'ONLINE': 'cyan',
            'OFFLINE': 'orange',
            'HYBRID': 'purple'
        };
        const modeLabels = {
            'ONLINE': 'Trực tuyến',
            'OFFLINE': 'Trực tiếp',
            'HYBRID': 'Kết hợp'
        };
        return <Tag color={modeColors[mode]}>{modeLabels[mode]}</Tag>;
    };

    const resetFilters = () => {
        setSearchTerm('');
        setDateRange(null);
        setMode(null);
    };

    const [cancelling, setCancelling] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

    const showConfirmModal = (eventId: number) => {
        setSelectedEventId(eventId);
        setIsModalOpen(true);
    };

    const handleCancelRegistration = async () => {
        if (!selectedEventId) return;

        try {
            setCancelling(selectedEventId);
            await apiCall(`/registrations/${selectedEventId}`, {
                method: 'DELETE'
            });

            notification.success({
                message: 'Success',
                description: 'Successfully cancelled registration'
            });

            // Refresh the events list
            const data = await apiCall<RegisteredEvent[]>('/events/registered');
            setAllEvents(data);
            setFiltereredEvents(data);
            setIsModalOpen(false);
            window.location.reload(); // Reload to reflect changes
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Failed to cancel registration'
            });
        } finally {
            setCancelling(null);
            setSelectedEventId(null);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <HomeLayout>
            <div style={{ padding: "24px" }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    background: '#ff8533',
                    padding: '24px',
                    borderRadius: '8px',
                    color: 'white'
                }}>
                    <Space align="center" size="middle">
                        <CalendarOutlined style={{ fontSize: '32px' }} />
                        <Title level={2} style={{ margin: 0, color: 'white' }}>
                            Sự kiện đã đăng ký
                        </Title>
                    </Space>
                </div>

                {filteredEvents.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {filteredEvents.map((event) => (
                            <Col xs={24} sm={12} md={8} key={event.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <img
                                            alt={event.name}
                                            src={event.posterUrl}
                                            style={{ height: 200, objectFit: 'cover' }}
                                        />
                                    }
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                        <div style={{ minHeight: 32 }}>
                                            <Space size={[0, 8]} wrap>
                                                {getEventTypeTag(event.typeName)}
                                                {getModeTag(event.mode)}
                                                <Tag color="green">{event.registrationStatus}</Tag>
                                            </Space>
                                        </div>

                                        <Typography.Title
                                            level={4}
                                            ellipsis={{ rows: 1 }}
                                            style={{ marginTop: 0, marginBottom: 0 }}
                                        >
                                            {event.name}
                                        </Typography.Title>

                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Text type="secondary" ellipsis>
                                                <CalendarOutlined /> {format(parseISO(event.startTime), "dd/MM/yyyy HH:mm")}
                                            </Text>
                                            <Text type="secondary" ellipsis>
                                                <EnvironmentOutlined /> {event.locationAddress}
                                            </Text>
                                        </Space>

                                        <Button
                                            type="primary"
                                            block
                                            onClick={() => router.push(`/events/${event.id}`)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                        <Button
                                            type="default"
                                            danger
                                            block
                                            loading={cancelling === event.id}
                                            onClick={() => showConfirmModal(event.id)}
                                        >
                                            Hủy đăng ký
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        description="Bạn chưa đăng ký sự kiện nào"
                        style={{ margin: '48px 0' }}
                    />
                )}

                <Modal
                    title="Xác nhận hủy đăng ký"
                    open={isModalOpen}
                    onOk={handleCancelRegistration}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedEventId(null);
                    }}
                    confirmLoading={cancelling !== null}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {selectedEventId && filteredEvents.find(e => e.id === selectedEventId) && (
                            <>
                                <Title level={4}>
                                    {filteredEvents.find(e => e.id === selectedEventId)?.name}
                                </Title>
                                <Descriptions column={1}>
                                    <Descriptions.Item label="Thời gian">
                                        {format(
                                            parseISO(filteredEvents.find(e => e.id === selectedEventId)?.startTime || ''),
                                            "dd/MM/yyyy HH:mm"
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Địa điểm">
                                        {filteredEvents.find(e => e.id === selectedEventId)?.locationAddress}
                                    </Descriptions.Item>
                                </Descriptions>
                                <Text>
                                    Bạn có chắc chắn muốn hủy đăng ký sự kiện này không?
                                </Text>    
                             
                            </>
                        )}
                    </Space>
                </Modal>
            </div>
        </HomeLayout>
    );
}