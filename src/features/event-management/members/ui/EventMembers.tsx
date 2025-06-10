import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag } from 'antd';
import { PlusOutlined, UserDeleteOutlined, EditOutlined } from '@ant-design/icons';
import { EventMember, EventMemberRole } from '../model/types';
import { getEventMembers, addEventMember, removeEventMember, updateMemberRole, getStaffRoles } from '../model/api';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';
import styles from './EventMembers.module.css';
import React from 'react';

interface EventMembersProps {
    departmentCode: string;
    eventId: number;
}

// Helper to get label after last underscore
const getRoleLabel = (role: string) => role.replace(/^EVENT_/, '');

// Helper to get color for each role
const getRoleColor = (role: string) => {
    switch (role) {
        case EventMemberRole.EVENT_MANAGER:
            return 'geekblue';
        case EventMemberRole.EVENT_CHECKIN:
            return 'green';
        case EventMemberRole.EVENT_STAFF:
            return 'orange';
        default:
            return 'default';
    }
};

export function EventMembers({ departmentCode, eventId }: EventMembersProps) {
    const [members, setMembers] = useState<EventMember[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<EventMember | null>(null);
    const [selectedAddRole, setSelectedAddRole] = useState<string[]>([]);
    const [form] = Form.useForm();
    const { showSuccess, showError } = useAntdMessage();
    const [roleOptions, setRoleOptions] = useState<{ value: string; label: string; description: string; raw: any }[]>([]);
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    const [searchText, setSearchText] = useState('');

    // Fetch members when component mounts
    useEffect(() => {
        fetchMembers(currentPage, pageSize);
    }, [departmentCode, eventId]);

    const fetchMembers = async (page: number, size: number) => {
        try {
            const response = await getEventMembers(departmentCode, eventId, page, size);
            setMembers(response.members);
            setTotal(response.total);
        } catch (error) {
            showError('Failed to fetch members');
        }
    };

    const fetchRoles = async () => {
        try {
            const roles = await getStaffRoles();
            const mapped = Array.isArray(roles)
                ? roles.map((r: any) => ({ value: r.roleName, label: getRoleLabel(r.roleName), description: r.description, raw: r }))
                : [];
            setRoleOptions(mapped);
        } catch {
            setRoleOptions([]);
        }
    };

    const handleAddMember = async (values: { email: string; role: string[] }) => {
        try {
            await addEventMember(departmentCode, eventId, { email: values.email, roleName: values.role });
            showSuccess('Member added successfully');
            setIsModalOpen(false);
            form.resetFields();
            fetchMembers(currentPage, pageSize);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to add member';
            form.setFields([{ name: 'email', errors: [''] }]);
            showError(message);
        }
    };

    const handleRemoveMember = async (memberEmail: string) => {
        try {
            await removeEventMember(departmentCode, eventId, memberEmail);
            showSuccess('Member removed successfully');
            fetchMembers(currentPage, pageSize);
        } catch (error) {
            showError('Failed to remove member');
        }
    };

    const openAddModal = () => {
        setIsModalOpen(true);
        setSelectedAddRole([]);
        fetchRoles();
    };

    const openEditModal = (member: EventMember) => {
        setEditingMember(member);
        setSelectedAddRole(member.roleName);
        setEditModalOpen(true);
        fetchRoles();
    };

    const handleUpdateRole = async () => {
        if (!selectedAddRole || selectedAddRole.length === 0) {
            const message = 'Please select at least one role!';
            showError(message);
            return;
        }
        if (editingMember) {
            await updateMemberRole(departmentCode, eventId, editingMember.email, selectedAddRole);
            fetchMembers(currentPage, pageSize);
            showSuccess('Role updated!');
            setEditModalOpen(false);
            setEditingMember(null);
        }
    };

    // Lấy các role thực tế đang có trong danh sách members
    const memberRoleOptions = Array.from(
        new Set(members.flatMap(m => m.roleName))
    ).map(role => ({ value: role, label: getRoleLabel(role) }));

    // Lọc và sắp xếp members theo role, search và thời gian update
    const filteredMembers = members
        .filter(member => {
            // Filter theo role
            const matchRole =
                roleFilter.length === 0 ||
                member.roleName.some(role => roleFilter.includes(role));
            // Filter theo search
            const keyword = searchText.trim().toLowerCase();
            const matchSearch =
                !keyword ||
                member.staffName.toLowerCase().includes(keyword) ||
                member.email.toLowerCase().includes(keyword);
            return matchRole && matchSearch;
        })
        .sort((a, b) => {
            // Sắp xếp theo thời gian update mới nhất
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });


    const handleRoleChange = (value: string[]) => {
        setSelectedAddRole(value);
        form.setFieldsValue({ role: value });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'staffName',
            key: 'staffName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role(s)',
            dataIndex: 'roleName',
            key: 'roleName',
            render: (roles: string[]) => (
                <span>
                    {roles.map(role => (
                        <Tag color={getRoleColor(role)} key={role}>{getRoleLabel(role)}</Tag>
                    ))}
                </span>
            ),
        },
        {
            title: 'Assigned At',
            dataIndex: 'assignedAt',
            key: 'assignedAt',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: EventMember) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<UserDeleteOutlined />}
                        onClick={() => handleRemoveMember(record.email)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ gap: 16 }}>
                <div style={{ display: 'flex', flex: 1, gap: 16 }}>
                    <Input.Search
                        allowClear
                        placeholder="Search by name or email"
                        style={{ maxWidth: 260 }}
                        value={searchText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                    />
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Filter by role"
                        style={{ minWidth: 180 }}
                        value={roleFilter}
                        onChange={setRoleFilter}
                        options={memberRoleOptions}
                    />
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openAddModal}
                    style={{ marginLeft: 'auto' }}
                >
                    Add Member
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={filteredMembers}
                rowKey="email"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: (page: number, size: number) => {
                        setCurrentPage(page);
                        setPageSize(size);
                        fetchMembers(page, size);
                    },
                }}
            />

            <Modal
                title="Add Member"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setSelectedAddRole([]);
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleAddMember}
                    layout="vertical"
                    initialValues={{ role: [] }}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input placeholder="Enter member's email" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select at least one role!' }]}
                    >
                        <div>
                            <Select
                                mode="multiple"
                                placeholder="Select role(s)"
                                onChange={handleRoleChange}
                                options={roleOptions}
                            />
                            {selectedAddRole.length > 0 && (
                                <div style={{ color: '#888', marginTop: 4 }}>
                                    {selectedAddRole.map(role => {
                                        const found = roleOptions.find(opt => opt.value === role);
                                        return found ? (
                                            <div key={role}>{getRoleLabel(found.value)}: {found.description}</div>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Add
                            </Button>
                            <Button onClick={() => {
                                setIsModalOpen(false);
                                form.resetFields();
                                setSelectedAddRole([]);
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Update Member Role"
                open={editModalOpen}
                onOk={handleUpdateRole}
                onCancel={() => {
                    setEditModalOpen(false);
                    setSelectedAddRole([]);
                }}
                okText="Update"
                cancelText="Cancel"
            >
                <div>
                    <Select
                        mode="multiple"
                        value={selectedAddRole}
                        onChange={setSelectedAddRole}
                        style={{ width: '100%' }}
                        options={roleOptions}
                    />
                    {selectedAddRole.length > 0 && (
                        <div style={{ color: '#888', marginTop: 8 }}>
                            {selectedAddRole.map(role => {
                                const found = roleOptions.find(opt => opt.value === role);
                                return found ? (
                                    <div key={role}>{getRoleLabel(found.value)}: {found.description}</div>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
} 