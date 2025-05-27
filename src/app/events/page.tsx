"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import HomeLayout from "@/components/HomeLayout";
import Loading from "@/components/Loading";
import { Card, Typography, Row, Col, Input, Select, Empty, Tag, Space, Button } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, ClearOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

// Using the same Event type from FPT Event project
type Event = {
    id: string;
    title: string;
    address: string;
    startTime: Date;
    endTime: Date;
    registrationStartTime: Date;
    registrationEndTime: Date;
    type: 'seminar' | 'workshop' | 'orientation' | 'other';
    allowedParticipants: ('student' | 'lecturer')[];
    studentCapacity: number;
    lecturerCapacity: number;
    description: string;
    descriptionImages: string[];
    department: {
        id: string;
        name: string;
        members: any[];
    };
    poster: string;
    banner: string;
    status: string;
};

// Mock events data (using the same data from FPT Event project)
const events: Event[] = [/* Copy the events array from EventsPage.tsx */
    {
        id: '1',
        title: 'Innovation Day 2025',
        address: 'Hội trường A, ĐH FPT TP.HCM',
        startTime: new Date('2025-05-15T08:00:00'),
        endTime: new Date('2025-05-15T17:00:00'),
        registrationStartTime: new Date('2025-04-15T00:00:00'),
        registrationEndTime: new Date('2025-05-10T23:59:59'),
        type: 'seminar',
        allowedParticipants: ['student', 'lecturer'],
        studentCapacity: 500,
        lecturerCapacity: 50,
        description: 'Ngày hội công nghệ lớn nhất năm tại FPT University với sự tham gia của các chuyên gia hàng đầu trong lĩnh vực công nghệ thông tin.',
        descriptionImages: [],
        department: {
            id: '1',
            name: 'Khoa Công nghệ thông tin',
            members: []
        },
        poster: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
    {
        id: '2',
        title: 'Career Expo 2025',
        address: 'Sảnh chính, ĐH FPT TP.HCM',
        startTime: new Date('2025-06-20T09:00:00'),
        endTime: new Date('2025-06-20T16:00:00'),
        registrationStartTime: new Date('2025-05-20T00:00:00'),
        registrationEndTime: new Date('2025-06-15T23:59:59'),
        type: 'seminar',
        allowedParticipants: ['student'],
        studentCapacity: 600,
        lecturerCapacity: 0,
        description: 'Ngày hội việc làm với sự tham gia của hơn 50 doanh nghiệp hàng đầu, mang đến cơ hội việc làm và thực tập cho sinh viên.',
        descriptionImages: [],
        department: {
            id: '2',
            name: 'Phòng Quan hệ doanh nghiệp',
            members: []
        },
        poster: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
    {
        id: '3',
        title: 'Hackathon FPTU 2025',
        address: 'Khu vực Innovation, ĐH FPT TP.HCM',
        startTime: new Date('2025-07-10T08:00:00'),
        endTime: new Date('2025-07-12T20:00:00'),
        registrationStartTime: new Date('2025-06-10T00:00:00'),
        registrationEndTime: new Date('2025-07-05T23:59:59'),
        type: 'workshop',
        allowedParticipants: ['student'],
        studentCapacity: 300,
        lecturerCapacity: 0,
        description: 'Cuộc thi lập trình trong 48 giờ với chủ đề "Công nghệ vì cộng đồng". Cơ hội thể hiện kỹ năng, học hỏi và giành giải thưởng lớn.',
        descriptionImages: [],
        department: {
            id: '1',
            name: 'Khoa Công nghệ thông tin',
            members: []
        },
        poster: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
    {
        id: '4',
        title: 'FPT AI Challenge 2025',
        address: 'Hội trường B, ĐH FPT TP.HCM',
        startTime: new Date('2025-08-25T08:30:00'),
        endTime: new Date('2025-08-25T17:30:00'),
        registrationStartTime: new Date('2025-07-25T00:00:00'),
        registrationEndTime: new Date('2025-08-20T23:59:59'),
        type: 'workshop',
        allowedParticipants: ['student', 'lecturer'],
        studentCapacity: 400,
        lecturerCapacity: 50,
        description: 'Thách thức trí tuệ nhân tạo - nơi các sinh viên và giảng viên cùng giải quyết các bài toán thực tế sử dụng các công nghệ AI tiên tiến.',
        descriptionImages: [],
        department: {
            id: '1',
            name: 'Khoa Công nghệ thông tin',
            members: []
        },
        poster: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
    {
        id: '5',
        title: 'Workshop: Digital Marketing Trends 2025',
        address: 'Phòng Workshop, ĐH FPT TP.HCM',
        startTime: new Date('2025-09-05T13:00:00'),
        endTime: new Date('2025-09-05T17:00:00'),
        registrationStartTime: new Date('2025-08-05T00:00:00'),
        registrationEndTime: new Date('2025-09-03T23:59:59'),
        type: 'workshop',
        allowedParticipants: ['student', 'lecturer'],
        studentCapacity: 150,
        lecturerCapacity: 20,
        description: 'Workshop chuyên sâu về xu hướng Digital Marketing trong năm 2025 với sự tham gia của các chuyên gia từ các công ty marketing hàng đầu.',
        descriptionImages: [],
        department: {
            id: '3',
            name: 'Khoa Quản trị Kinh doanh',
            members: []
        },
        poster: 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
    {
        id: '6',
        title: 'Orientation Day - Khóa ĐH 2025',
        address: 'Sân vận động, ĐH FPT TP.HCM',
        startTime: new Date('2025-09-15T07:30:00'),
        endTime: new Date('2025-09-15T16:00:00'),
        registrationStartTime: new Date('2025-08-15T00:00:00'),
        registrationEndTime: new Date('2025-09-10T23:59:59'),
        type: 'orientation',
        allowedParticipants: ['student'],
        studentCapacity: 1000,
        lecturerCapacity: 0,
        description: 'Ngày định hướng dành cho tân sinh viên khóa 2025, giúp các bạn làm quen với môi trường học tập tại FPT University.',
        descriptionImages: [],
        department: {
            id: '4',
            name: 'Phòng Đào tạo',
            members: []
        },
        poster: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
    {
        id: '7',
        title: 'Hội thảo: Blockchain và Web3',
        address: 'Hội trường C, ĐH FPT TP.HCM',
        startTime: new Date('2025-10-05T09:00:00'),
        endTime: new Date('2025-10-05T16:30:00'),
        registrationStartTime: new Date('2025-09-05T00:00:00'),
        registrationEndTime: new Date('2025-10-02T23:59:59'),
        type: 'seminar',
        allowedParticipants: ['student', 'lecturer'],
        studentCapacity: 300,
        lecturerCapacity: 30,
        description: 'Hội thảo chuyên sâu về công nghệ Blockchain và Web3, tương lai của internet phân tán.',
        descriptionImages: [],
        department: {
            id: '1',
            name: 'Khoa Công nghệ thông tin',
            members: []
        },
        poster: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
    {
        id: '8',
        title: 'Workshop: UX/UI Design',
        address: 'Phòng Lab Design, ĐH FPT TP.HCM',
        startTime: new Date('2025-10-15T14:00:00'),
        endTime: new Date('2025-10-15T17:30:00'),
        registrationStartTime: new Date('2025-09-15T00:00:00'),
        registrationEndTime: new Date('2025-10-12T23:59:59'),
        type: 'workshop',
        allowedParticipants: ['student'],
        studentCapacity: 100,
        lecturerCapacity: 0,
        description: 'Workshop thực hành về thiết kế trải nghiệm người dùng và giao diện với các công cụ hiện đại.',
        descriptionImages: [],
        department: {
            id: '1',
            name: 'Khoa Công nghệ thông tin',
            members: []
        },
        poster: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        banner: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        status: 'upcoming'
    },
];

export default function EventsPage() {
    const { session, status } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);

    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
        }
    }, [status]);

    useEffect(() => {
        let filtered = events;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term)
            );
        }

        if (selectedType) {
            filtered = filtered.filter(event => event.type === selectedType);
        }

        if (selectedDepartment) {
            filtered = filtered.filter(event => event.department.id === selectedDepartment);
        }

        setFilteredEvents(filtered);
    }, [searchTerm, selectedType, selectedDepartment]);

    const getEventTypeTag = (type: Event['type']) => {
        const typeColors = {
            seminar: 'blue',
            workshop: 'purple',
            orientation: 'green',
            other: 'default'
        };

        const typeTexts = {
            seminar: 'Hội thảo',
            workshop: 'Workshop',
            orientation: 'Định hướng',
            other: 'Khác'
        };

        return <Tag color={typeColors[type]}>{typeTexts[type]}</Tag>;
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedDepartment('');
    };

    if (status === "loading") {
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
                        <Row gutter={[16, 16]} justify="center">
                            <Col span={16}>
                                <Search
                                    placeholder="Tìm kiếm sự kiện..."
                                    allowClear
                                    enterButton
                                    size="large"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
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
                                        { value: '', label: 'Tất cả' },
                                        { value: 'seminar', label: 'Hội thảo' },
                                        { value: 'workshop', label: 'Workshop' },
                                        { value: 'orientation', label: 'Định hướng' },
                                        { value: 'other', label: 'Khác' },
                                    ]}
                                />
                            </Col>
                            <Col>
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Phòng ban tổ chức"
                                    allowClear
                                    value={selectedDepartment}
                                    onChange={setSelectedDepartment}
                                    options={[
                                        { value: '', label: 'Tất cả' },
                                        ...Array.from(new Set(events.map(event => event.department.id)))
                                            .map(id => {
                                                const event = events.find(e => e.department.id === id);
                                                return {
                                                    value: event?.department.id,
                                                    label: event?.department.name
                                                };
                                            })
                                    ]}
                                />
                            </Col>
                            <Col>
                                <Button 
                                    icon={<ClearOutlined />}
                                    onClick={resetFilters}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </Col>
                        </Row>
                    </Space>
                </Card>

                {filteredEvents.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {filteredEvents.map((event) => (
                            <Col xs={24} sm={12} md={8} key={event.id}>
                                <Card
                                    hoverable
                                    cover={
                                        <img
                                            alt={event.title}
                                            src={event.poster}
                                            style={{ height: 200, objectFit: 'cover' }}
                                        />
                                    }
                                    onClick={() => router.push(`/events/${event.id}`)}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {getEventTypeTag(event.type)}
                                        <Title level={4}>{event.title}</Title>
                                        <Paragraph ellipsis={{ rows: 2 }}>{event.description}</Paragraph>
                                        <Space direction="vertical" size="small">
                                            <Text type="secondary">
                                                <CalendarOutlined /> {format(event.startTime, "dd/MM/yyyy HH:mm")}
                                            </Text>
                                            <Text type="secondary">
                                                <EnvironmentOutlined /> {event.address}
                                            </Text>
                                            <Text type="secondary">
                                                <TeamOutlined /> {event.studentCapacity + event.lecturerCapacity} vị trí
                                            </Text>
                                        </Space>
                                        <Button type="primary" block>
                                            Xem chi tiết
                                        </Button>
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        description="No events found"
                        style={{ margin: '48px 0' }}
                    />
                )}
            </div>
        </HomeLayout>
    );
}