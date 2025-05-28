'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Button, Tag, Space, Table, Select, Dropdown } from 'antd';

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

export function EventList({ userDepartmentRoles }: EventListProps) {
    const router = useRouter();
    const { showError } = useAntdMessage();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [search, setSearch] = useState('');

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

    const getActionItems = (record: Event): MenuItemType[] => [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View',
            onClick: () => router.push(`/organizer/events/${record.id}`),
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => router.push(`/organizer/events/${record.id}/edit`),
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            danger: true,
            onClick: () => {
                // TODO: Implement delete functionality
                console.log('Delete event:', record.id);
            },
        },
    ];

    const columns = [
        {
            title: 'Event Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Event) => (
                <a onClick={() => router.push(`/organizer/events/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'typeName',
            key: 'typeName',
        },
        {
            title: 'Mode',
            dataIndex: 'mode',
            key: 'mode',
        },
        {
            title: 'Audience',
            dataIndex: 'audience',
            key: 'audience',
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
            render: (status: EventStatus) => (
                <Tag color={EVENT_STATUS_COLORS[status]}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (record: Event) => (
                <Dropdown
                    menu={{ items: getActionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 10, border: '1px solid #d9d9d9', padding: '10px', borderRadius: '8px' }}>

                <Col flex="1" >
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        style={{ width: 300 }}
                        placeholder="Tìm kiếm sự kiện"
                    />
                </Col>
                <Col>
                    <Space>
                        <Select
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            style={{ width: 200 }}
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
                            Create New Event
                        </Button>
                    </Space>
                </Col>
            </Row>

            {filteredEvents.map(event => (
                <EventCard
                    key={event.id}
                    event={event}
                    onOverview={() => router.push(`/organizer/events/${event.id}`)}
                    onMembers={() => router.push(`/organizer/events/${event.id}/members`)}
                    onEdit={() => router.push(`/organizer/events/${event.id}/edit`)}
                    onSurvey={() => router.push(`/organizer/events/${event.id}/survey`)}
                />
            ))}
        </div>
    );
} 