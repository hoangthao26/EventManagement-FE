'use client';

import { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, Input, Pagination } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, SearchOutlined } from '@ant-design/icons';
import { Event } from '../model/types';
import { getStaffEvents } from '../model/api';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import styles from './CheckInList.module.css';
import Loading from '@/shared/ui/Loading';

const { Title, Text } = Typography;
const { Search } = Input;

const PAGE_SIZE = 3;

export function CheckInList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getStaffEvents();
                setEvents(data);
                setFilteredEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleSearch = (value: string) => {
        const searchValue = value.toLowerCase().trim();
        if (!searchValue) {
            setFilteredEvents(events);
            return;
        }
        const filtered = events.filter(event =>
            event.name.toLowerCase().includes(searchValue)
        );
        setFilteredEvents(filtered);
        setCurrentPage(1); // Reset to first page when searching
    };

    const getStatusColor = (status: Event['status']) => {
        switch (status) {
            case 'PUBLISHED':
                return 'green';
            case 'DRAFT':
                return 'default';
            case 'COMPLETED':
                return 'blue';
            case 'CANCELLED':
                return 'red';
            case 'BLOCKED':
                return 'volcano';
            case 'CLOSED':
                return 'gray';
            default:
                return 'default';
        }
    };

    const getModeColor = (mode?: string) => {
        switch (mode) {
            case 'ONLINE':
                return 'blue';
            case 'HYBRID':
                return 'purple';
            case 'OFFLINE':
                return 'green';
            default:
                return 'green';
        }
    };

    const shouldShowLocation = (mode?: string) => {
        return mode === 'OFFLINE' || mode === 'HYBRID';
    };

    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    if (loading) {
        return <Loading />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>

                <Search
                    placeholder="Search event name"
                    allowClear
                    onSearch={handleSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                    style={{ width: 300, padding: '20px 0px' }}
                    prefix={<SearchOutlined />}
                />
            </div>
            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 4 }}
                dataSource={paginatedEvents}
                renderItem={(event: Event) => (
                    <List.Item>
                        <Card
                            hoverable
                            onClick={() => router.push(`/check-in/${event.id}`)}
                            cover={
                                event.bannerUrl ? (
                                    <img
                                        alt={event.name}
                                        src={event.bannerUrl}
                                        className={styles.cardImage}
                                    />
                                ) : null
                            }
                            className={styles.card}
                            bodyStyle={{ padding: '16px 24px' }}
                            title={null}
                        >
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Typography.Title level={4} style={{ margin: 0 }}>{event.name}</Typography.Title>
                                    <Tag color={getModeColor(event.mode)}>
                                        {event.mode || 'OFFLINE'}
                                    </Tag>
                                </div>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <Text>
                                    {event.startTime && !isNaN(new Date(event.startTime).getTime()) ? (
                                        <div className={styles.timeContainer}>
                                            <div className={styles.timeBlock}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Start</Text>
                                                <div style={{ marginTop: 4 }}>
                                                    <Text>
                                                        <Text strong>{format(new Date(event.startTime), 'PP')}</Text>
                                                        <Text type="secondary" style={{ marginLeft: 8 }}>{format(new Date(event.startTime), 'p')}</Text>
                                                    </Text>
                                                </div>
                                            </div>
                                            <div className={styles.timeBlock}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>End</Text>
                                                <div style={{ marginTop: 4 }}>
                                                    <Text>
                                                        <Text strong>{format(new Date(event.endTime), 'PP')}</Text>
                                                        <Text type="secondary" style={{ marginLeft: 8 }}>{format(new Date(event.endTime), 'p')}</Text>
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        'Chưa cập nhật'
                                    )}
                                </Text>
                            </div>
                            <div style={{ marginBottom: 8, height: 40 }}>
                                {shouldShowLocation(event.mode) && (
                                    <Text>
                                        <EnvironmentOutlined style={{ marginRight: 8 }} />
                                        {event.location}
                                    </Text>
                                )}
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Pagination
                    current={currentPage}
                    total={filteredEvents.length}
                    pageSize={PAGE_SIZE}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
} 