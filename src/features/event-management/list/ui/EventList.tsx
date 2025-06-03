'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Button, Tag, Space, Table, Select, Dropdown, Pagination, Segmented, List } from 'antd';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { Event, EventStatus } from '../model/types';
import { eventApi } from '../model/api';
import { EVENT_STATUS_COLORS } from '../lib/constants';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';
import { MenuItemType } from 'antd/es/menu/interface';
import { EventCard } from './EventCard';
import { SearchInput } from '@/shared/ui/SearchInput';
import styles from '../styles/event-list.module.css';
const { Title } = Typography;
const { Option } = Select;

interface DepartmentRole {
    departmentCode: string;
    departmentName: string;
    roleName: string;
}

interface EventListProps {
    userDepartmentRoles: DepartmentRole[];
}

const EVENT_STATUS_OPTIONS = [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Canceled', value: 'CANCELED' },
    { label: 'Blocked', value: 'BLOCKED' },
];

const SEGMENT_GROUP_1 = [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Completed', value: 'COMPLETED' },

];
const SEGMENT_GROUP_2 = [
    { label: 'Canceled', value: 'CANCELED' },
    { label: 'Blocked', value: 'BLOCKED' },
    { label: 'Draft', value: 'DRAFT' },
];

function useIsMobile(breakpoint = 800) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [breakpoint]);
    return isMobile;
}

export function EventList({ userDepartmentRoles }: EventListProps) {
    const router = useRouter();
    const { showError } = useAntdMessage();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 2;
    const [selectedStatus, setSelectedStatus] = useState<string>('PUBLISHED');
    const isMobile = useIsMobile();

    // Reset page when status changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus]);

    // Set initial department when component mounts
    useEffect(() => {
        if (userDepartmentRoles.length > 0 && !selectedDepartment) {
            setSelectedDepartment(userDepartmentRoles[0].departmentCode);
        }
    }, [userDepartmentRoles]);

    const fetchEvents = async () => {
        if (!selectedDepartment) return;

        try {
            setLoading(true);
            const response = await eventApi.getEventsByDepartment(selectedDepartment);
            setEvents(response);
        } catch (error: any) {
            console.error('Failed to fetch events:', error);
            showError(error.response?.data?.message || 'Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDepartment) {
            fetchEvents();
        }
    }, [selectedDepartment]);

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
    };

    // Lọc và sắp xếp event
    const filteredEvents = events
        .filter(event =>
            event.name.toLowerCase().includes(search.toLowerCase()) &&
            (selectedStatus ? event.status === selectedStatus : true)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Lấy 2 event theo trang
    const pagedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div >
            {!isMobile ? (
                <Row
                    justify="space-between"
                    align="middle"
                    style={{ flexWrap: 'wrap', rowGap: 8, height: 'auto', marginBottom: 16 }}
                >
                    <Col style={{ minWidth: 220, maxWidth: 240, flex: 1 }}>
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            style={{ width: '100%', height: 40, boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)' }}
                            placeholder="Tìm kiếm sự kiện"
                        />
                    </Col>
                    <Col style={{ minWidth: 500, flex: 6, display: 'flex', justifyContent: 'center', borderRadius: '8px' }}>
                        <Segmented
                            className={styles.customSegmented}
                            options={EVENT_STATUS_OPTIONS}
                            value={selectedStatus}
                            size="large"
                            onChange={setSelectedStatus}
                            style={{
                                width: '100%',
                                maxWidth: 710,
                                background: '#fff',
                                border: '1px solid #e0e0e0',
                                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
                            }}
                            block
                        />
                    </Col>
                    <Col style={{ minWidth: 180, flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Select
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            style={{ width: '100%', maxWidth: 175, height: 40, boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)' }}
                            placeholder="Select Department"
                        >
                            {userDepartmentRoles.map((dept) => (
                                <Option key={dept.departmentCode} value={dept.departmentCode}>
                                    {dept.departmentName}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            ) : (
                <>
                    <Row
                        justify="space-between"
                        align="middle"
                        style={{ marginBottom: 8, flexWrap: 'nowrap' }}
                    >
                        <Col style={{ flex: 1, minWidth: 120 }}>
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                style={{ width: '100%', height: 40, boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)' }}
                                placeholder="Tìm kiếm sự kiện"
                            />
                        </Col>
                        <Col style={{ flex: 1, minWidth: 120, display: 'flex', justifyContent: 'flex-end' }}>
                            <Select
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                style={{ width: '100%', maxWidth: 175, height: 40, boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)' }}
                                placeholder="Select Department"
                            >
                                {userDepartmentRoles.map((dept) => (
                                    <Option key={dept.departmentCode} value={dept.departmentCode}>
                                        {dept.departmentName}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={24} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Segmented
                                className={styles.customSegmented}
                                options={SEGMENT_GROUP_1}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                style={{ width: '100%', maxWidth: 400, marginBottom: 8 }}
                                block
                            />
                            <Segmented
                                className={styles.customSegmented}
                                options={SEGMENT_GROUP_2}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                style={{ width: '100%', maxWidth: 400 }}
                                block
                            />
                        </Col>
                    </Row>
                </>
            )}

            <List
                itemLayout="vertical"
                size="large"
                dataSource={pagedEvents}
                renderItem={(event: Event) => (
                    <List.Item key={event.id} style={{ padding: 0, border: 'none' }}>
                        <EventCard
                            event={event}
                            onOverview={() => router.push(`/organizer/events/${event.id}`)}
                            onMembers={() => router.push(`/organizer/events/${event.id}/members`)}
                            onEdit={() => router.push(`/organizer/events/${selectedDepartment}/${event.id}/update`)}
                            onSurvey={() => router.push(`/organizer/events/${event.id}/survey`)}
                        />
                    </List.Item>
                )}
            />

            {filteredEvents.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredEvents.length}
                        onChange={setCurrentPage}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
} 