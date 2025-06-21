"use client";

import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import axiosInstance from '@/shared/lib/axios';

const { Title, Paragraph } = Typography;

interface EventTag {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

interface UpcomingEvent {
    id: number;
    name: string;
    departmentName: string;
    typeName: string;
    audience: string;
    status: string;
    locationAddress: string;
    locationAddress2: string;
    startTime: string;
    endTime: string;
    posterUrl: string;
    bannerUrl: string;
    description: string;
    mode: string;
    tags: EventTag[];
}

// Hardcoded fallback events
const fallbackUpcomingEvents: UpcomingEvent[] = [
    {
        id: 1,
        name: "Workshop Thiết kế UI/UX",
        departmentName: "Phòng Đào tạo",
        typeName: "Workshop",
        audience: "STUDENT",
        status: "PUBLISHED",
        locationAddress: "Phòng lab A1.204",
        locationAddress2: "Tòa A1, TP.Thủ Đức",
        startTime: "2025-06-25T14:00:00",
        endTime: "2025-06-25T17:00:00",
        posterUrl: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
        bannerUrl: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
        description: "Học cách thiết kế giao diện người dùng hiệu quả và thu hút",
        mode: "OFFLINE",
        tags: [
            {
                id: 1,
                name: "Design",
                description: "Design related events",
                createdAt: "2025-06-18T09:29:26.273543",
                updatedAt: "2025-06-18T09:29:26.273543"
            }
        ]
    },
    {
        id: 2,
        name: "Seminar Blockchain & Cryptocurrency",
        departmentName: "Phòng Công nghệ",
        typeName: "Seminar",
        audience: "BOTH",
        status: "PUBLISHED",
        locationAddress: "Hội trường B1",
        locationAddress2: "Tòa B1, TP.Thủ Đức",
        startTime: "2025-06-28T09:00:00",
        endTime: "2025-06-28T12:00:00",
        posterUrl: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg",
        bannerUrl: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg",
        description: "Khám phá thế giới blockchain và tiền điện tử với các chuyên gia",
        mode: "HYBRID",
        tags: [
            {
                id: 2,
                name: "Technology",
                description: "Technology related events",
                createdAt: "2025-06-18T09:29:26.273543",
                updatedAt: "2025-06-18T09:29:26.273543"
            }
        ]
    },
    {
        id: 3,
        name: "Orientation Sinh viên K18",
        departmentName: "Phòng Công tác SV",
        typeName: "Orientation",
        audience: "STUDENT",
        status: "PUBLISHED",
        locationAddress: "Sân vận động trường",
        locationAddress2: "Khuôn viên chính, TP.Thủ Đức",
        startTime: "2025-07-01T08:00:00",
        endTime: "2025-07-01T18:00:00",
        posterUrl: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg",
        bannerUrl: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg",
        description: "Chào mừng sinh viên K18 - Định hướng cuộc sống đại học",
        mode: "OFFLINE",
        tags: [
            {
                id: 3,
                name: "Student Life",
                description: "Student life related events",
                createdAt: "2025-06-18T09:29:26.273543",
                updatedAt: "2025-06-18T09:29:26.273543"
            }
        ]
    },
    {
        id: 4,
        name: "Talkshow Khởi nghiệp",
        departmentName: "Phòng Hợp tác DN",
        typeName: "Talkshow",
        audience: "BOTH",
        status: "PUBLISHED",
        locationAddress: "Hội trường C1",
        locationAddress2: "Tòa C1, TP.Thủ Đức",
        startTime: "2025-07-05T15:30:00",
        endTime: "2025-07-05T18:30:00",
        posterUrl: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg",
        bannerUrl: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg",
        description: "Chia sẻ kinh nghiệm từ các doanh nhân thành công",
        mode: "OFFLINE",
        tags: [
            {
                id: 4,
                name: "Entrepreneurship",
                description: "Business and entrepreneurship events",
                createdAt: "2025-06-18T09:29:26.273543",
                updatedAt: "2025-06-18T09:29:26.273543"
            }
        ]
    }
];

const UpcomingSection: React.FC = () => {
    const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>(fallbackUpcomingEvents);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            try {
                const response = await axiosInstance.get<UpcomingEvent[]>('/events/category/UPCOMING');
                
                if (response.data && response.data.length > 0) {
                    setUpcomingEvents(response.data);
                } else {
                    // Keep fallback events if no data
                    setUpcomingEvents(fallbackUpcomingEvents);
                }
            } catch (error) {
                console.error('Failed to fetch upcoming events:', error);
                // Keep fallback events on error
                setUpcomingEvents(fallbackUpcomingEvents);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingEvents();
    }, []);

    // Show fallback events while loading
    const displayEvents = loading ? fallbackUpcomingEvents : upcomingEvents;

    return (
        <div style={{ 
            background: '#27272a',
            width: '100%',
            margin: '0',
            padding: '25px 40px',
        }}>
            <div style={{ 
                maxWidth: 1200, 
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <Title level={2} style={{ color: 'white' }}>
                        Sự kiện sắp diễn ra
                    </Title>
                    <Paragraph style={{ color: '#a3a3a3', maxWidth: 600, margin: '0 auto' }}>
                        Đừng bỏ lỡ những sự kiện thú vị đang chờ đón bạn tại FPT University.
                        Đăng ký ngay để không bỏ lỡ cơ hội tham gia.
                    </Paragraph>
                </div>
                
                <div style={{ width: '100%' }}>
                    <Row gutter={[32, 32]} justify="center">
                        {displayEvents.slice(0, 4).map((event) => (
                            <Col xs={24} sm={12} lg={6} key={event.id}>
                                <Link href={`/events/${event.id}`}>
                                <Card 
                                    bordered={false}
                                    loading={loading}
                                    style={{ 
                                        background: 'transparent',
                                        textAlign: 'center',
                                        height: 'auto'
                                    }}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <div style={{ 
                                        position: 'relative',
                                        height: 375,
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            alt={event.name}
                                            src={event.posterUrl}
                                            style={{ 
                                                width: '100%',
                                                height: '100%', 
                                                objectFit: 'cover'
                                            }}
                                        />
                                        
                                        {/* Overlay with gradient */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            padding: '16px'
                                        }}>
                                            {/* Title at top */}
                                            <Title 
                                                level={5} 
                                                ellipsis={{ rows: 2 }} 
                                                style={{ 
                                                    color: 'white',
                                                    margin: 0,
                                                    textAlign: 'left',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                                }}
                                            >
                                                {event.name}
                                            </Title>
                                            
                                            {/* Button at bottom */}
                                            <Link href={`/events/${event.id}`}>
                                           
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </div>

                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                    <Link href="/events">
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<RightOutlined />}
                            style={{
                                background: '#ff8533',
                                borderColor: '#ff8533'
                            }}
                        >
                            Xem tất cả sự kiện
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UpcomingSection;