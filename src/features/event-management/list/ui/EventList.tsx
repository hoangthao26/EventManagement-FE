'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Button, Tag, Space, Table, Select, Dropdown, Pagination, Segmented } from 'antd';

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
    { label: 'Deleted', value: 'DELETED' },
];

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
        <div>
            <Row justify="space-between" align="middle"
                style={{ marginBottom: 12, border: '1px solid rgba(223, 148, 69, 0.73)', padding: '10px', borderRadius: '8px' }}>
                <Col flex="1" >
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        style={{ width: 250 }}
                        placeholder="Tìm kiếm sự kiện"
                    />
                </Col>
                <Col flex="1" style={{ display: 'flex', justifyContent: 'center', padding: '0 10px' }}>
                    <Segmented
                        className={styles.customSegmented}
                        options={EVENT_STATUS_OPTIONS}
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        style={{
                            width: 600,
                            height: 31.99,
                            background: '#fff',
                            borderRadius: 6,
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                            fontWeight: 600,
                        }}
                        block
                    />
                </Col>
                <Col>
                    <Space>
                        <Select
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            style={{ width: 180 }}
                            placeholder="Select Department"
                        >
                            {userDepartmentRoles.map((dept) => (
                                <Option key={dept.departmentCode} value={dept.departmentCode}>
                                    {dept.departmentName}
                                </Option>
                            ))}
                        </Select>
                        <Button
                            type="primary"
                            onClick={() => router.push('/organizer/create')}
                        >
                            Create Event
                        </Button>
                    </Space>
                </Col>
            </Row>



            {pagedEvents.map(event => (
                <EventCard
                    key={event.id}
                    event={event}
                    onOverview={() => router.push(`/organizer/events/${event.id}`)}
                    onMembers={() => router.push(`/organizer/events/${event.id}/members`)}
                    onEdit={() => router.push(`/organizer/events/${event.id}/edit`)}
                    onSurvey={() => router.push(`/organizer/events/${event.id}/survey`)}
                />
            ))}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredEvents.length}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
} 