"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import Loading from "@/shared/ui/Loading";
import { Card, Typography, Row, Col, Input, Select, Empty, Tag, Space, Button, notification, Pagination } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, ClearOutlined } from "@ant-design/icons";
import { format, parseISO } from "date-fns";
import HomeLayout from "@/widgets/layouts/ui/HomeLayout";
import { DatePicker } from 'antd';
import moment from "moment";
import axiosInstance from '@/shared/lib/axios';

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

// Add interfaces before the component
interface EventType {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
    description: string;
}

interface Department {
    id: number;
    code: string;
    name: string;
}
interface EventTag {
    id: number;
    name: string;
    description: string;
}

interface Event {
    id: number;
    name: string;
    departmentName: string;
    typeName: string;
    audience: 'STUDENT' | 'LECTURER' | 'BOTH';
    locationAddress: string;
    locationAddress2: string;
    startTime: string;
    endTime: string;
    posterUrl: string;
    bannerUrl: string;
    description: string;
    mode: 'ONLINE' | 'OFFLINE';
    tags: EventTag[];
    status?: string; // Add status for completed logic
}



type EventMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
type Audience = 'STUDENT' | 'LECTURER' | 'BOTH';

export default function EventsPage() {
    const { session, status } = useAuth();
    const router = useRouter();
    const [allEvents, setAllEvents] = useState<Event[]>([]); // Store all events
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]); // Store filtered events
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<number | null>(null);      // Change this
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);  // Change this
    const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
    const [mode, setMode] = useState<EventMode | null>(null);  // Change this
    const [audience, setAudience] = useState<Audience>('STUDENT');  // Default to STUDENT

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [paginatedEvents, setPaginatedEvents] = useState<Event[]>([]);

    // State for dropdown options
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Fetch all data on component mount
    useEffect(() => {
        let isSubscribed = true;        const fetchData = async () => {
            try {
                const [eventsRes, typesRes, tagsRes, depsRes] = await Promise.all([
                    axiosInstance.get<Event[]>('/events'),
                    axiosInstance.get<EventType[]>('/event-types'),
                    axiosInstance.get<Tag[]>('/tags/active'),
                    axiosInstance.get<Department[]>('/departments'),
                ]);
                
                if (isSubscribed) {
                    setAllEvents(eventsRes.data);
                    setFilteredEvents(eventsRes.data);
                    setEventTypes(typesRes.data);
                    setTags(tagsRes.data);
                    setDepartments(depsRes.data);
                    setLoading(false);
                }
            } catch (error) {
                if (isSubscribed) {
                    notification.error({
                        message: 'Error',
                        description: 'Failed to fetch data'
                    });
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isSubscribed = false;
        };
    }, []); // Empty dependency array since we only want to fetch once

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

        // Filter by event type
        if (selectedType !== null) {  // Change this condition
            result = result.filter(event =>
                eventTypes.find(type => type.id === selectedType)?.name === event.typeName
            );
        }

        // Filter by department
        if (selectedDepartment !== null) {
            result = result.filter(event =>
                departments.find(dept => dept.id === selectedDepartment)?.name === event.departmentName
            );
        }

        // Filter by mode
        if (mode !== null) {
            result = result.filter(event => event.mode === mode);
        }

        // Filter by audience
        if (audience !== 'BOTH') {
            result = result.filter(event => 
                event.audience === audience || event.audience === 'BOTH'
            );
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {  // Add null check for date range
            const [start, end] = dateRange;
            result = result.filter(event => {
                const eventDate = moment(event.startTime);
                return eventDate.isBetween(start, end, 'day', '[]');
            });
        }

        setFilteredEvents(result);
    }, [allEvents, searchTerm, selectedType, selectedTags, selectedDepartment, mode, audience, dateRange, eventTypes, departments]);

    // Pagination effect
    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setPaginatedEvents(filteredEvents.slice(startIndex, endIndex));
    }, [filteredEvents, currentPage, pageSize]);

    // Divide paginatedEvents into active and completed
    const activeEvents = paginatedEvents.filter(event => event.status !== "COMPLETED");
    const completedEvents = paginatedEvents.filter(event => event.status === "COMPLETED");

    const getEventTypeTag = (type: string) => {
        const typeColors: Record<string, string> = {
            'Seminar': 'blue',
            'Workshop': 'purple',
            'Orientation': 'green',
            'Other': 'default'
        };

        return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
    };

    const getModeTag = (mode: 'ONLINE' | 'OFFLINE') => {
        return <Tag color={mode === 'ONLINE' ? 'cyan' : 'orange'}>
            {mode === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}
        </Tag>;
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedType(null);
        setSelectedTags([]);
        setSelectedDepartment(null);
        setDateRange(null);
        setMode(null);
        setAudience('STUDENT');  // Add this line
        setCurrentPage(1); // Reset to first page
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
                            Các sự kiện tại FPT University
                        </Title>
                    </Space>
                </div>

                <Card style={{ marginBottom: 24 }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Row gutter={[16, 16]} justify="center" align="middle">
                            <Col flex="1">
                                <Search
                                    placeholder="Tìm kiếm sự kiện..."
                                    allowClear
                                    enterButton
                                    size="large"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Col>
                            <Col>
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={resetFilters}
                                    size="large"
                                >
                                    Xóa bộ lọc
                                </Button>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]} justify="center">
                            <Col>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Loại sự kiện"
                                    allowClear
                                    value={selectedType}
                                    onChange={setSelectedType}
                                    options={[
                                        { value: null, label: 'Tất cả' },
                                        ...eventTypes.map(type => ({
                                            value: type.id,
                                            label: type.name
                                        }))
                                    ]}
                                />
                            </Col>
                            <Col>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Tags"
                                    mode="multiple"
                                    allowClear
                                    value={selectedTags}
                                    onChange={setSelectedTags}
                                    options={tags.map(tag => ({
                                        value: tag.id,
                                        label: tag.name
                                    }))}
                                />
                            </Col>
                            <Col>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Phòng ban"
                                    allowClear
                                    value={selectedDepartment}
                                    onChange={setSelectedDepartment}
                                    options={[
                                        { value: null, label: 'Tất cả' },
                                        ...departments.map(dept => ({
                                            value: dept.id,
                                            label: dept.name
                                        }))
                                    ]}
                                />
                            </Col>
                            <Col>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Hình thức"
                                    allowClear
                                    value={mode}
                                    onChange={setMode}
                                    options={[
                                        { value: null, label: 'Tất cả' },
                                        { value: 'ONLINE', label: 'Trực tuyến' },
                                        { value: 'OFFLINE', label: 'Trực tiếp' },
                                        { value: 'HYBRID', label: 'Kết hợp' }
                                    ]}
                                />
                            </Col>
                            <Col>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Đối tượng"
                                    value={audience}
                                    onChange={setAudience}
                                    options={[
                                        { value: 'STUDENT', label: 'Sinh viên' },
                                        { value: 'LECTURER', label: 'Giảng viên' },
                                        { value: 'BOTH', label: 'Tất cả' }
                                    ]}
                                />
                            </Col>
                            <Col>
                                <RangePicker
                                    value={dateRange}
                                    onChange={(dates) => setDateRange(dates)}
                                    disabledDate={(current) => {
                                        return current && current < moment().startOf('day');
                                    }}
                                />
                            </Col>
                        </Row>
                    </Space>
                </Card>

                {filteredEvents.length > 0 ? (
                    <>
                        {/* Active Events Section */}
                        {activeEvents.length > 0 && (
                            <>
                                <Title level={3} style={{ margin: '24px 0 12px' }}>Sự kiện sắp tới</Title>
                                <Row gutter={[16, 16]}>
                                    {activeEvents.map((event) => (
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
                                                    <Button type="primary" block
                                                        onClick={() => router.push(`/events/${event.id}`)}
                                                    >
                                                        Xem chi tiết
                                                    </Button>
                                                </Space>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}

                        {/* Completed Events Section */}
                        {completedEvents.length > 0 && (
                            <>
                                <Title level={3} style={{ margin: '32px 0 12px' }}>Sự kiện đã hoàn thành</Title>
                                <Row gutter={[16, 16]}>
                                    {completedEvents.map((event) => (
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
                                                    <Button type="primary" block
                                                        onClick={() => router.push(`/events/${event.id}`)}
                                                    >
                                                        Xem chi tiết
                                                    </Button>
                                                </Space>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        )}

                        {/* Pagination */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                            <Pagination
                                current={currentPage}
                                total={filteredEvents.length}
                                pageSize={pageSize}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) => 
                                    `${range[0]}-${range[1]} of ${total} events`
                                }
                                pageSizeOptions={['6', '12', '24', '48']}
                                onChange={(page, size) => {
                                    setCurrentPage(page);
                                    if (size !== pageSize) {
                                        setPageSize(size);
                                        setCurrentPage(1); // Reset to first page when page size changes
                                    }
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <Empty
                        description="Không tìm thấy sự kiện nào"
                        style={{ margin: '48px 0' }}
                    />
                )}
            </div>
        </HomeLayout>
    );
}