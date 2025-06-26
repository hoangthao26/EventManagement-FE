"use client"

import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import { Table, Button, Modal, Form, Input, Row, Col, Tabs, Select, Radio, Popconfirm } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import axios from "axios";
import Loading from "@/shared/ui/Loading";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/features/event-management/create/ui/ImageUpload";
import { SearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useAntdMessage } from "@/shared/lib/hooks/useAntdMessage";

// Add interface for role type
interface RoleType {
    id: number;
    name: string;
    description: string;
}

// Add interface for department user type
interface DepartmentUserType {
    userId: number;
    userName: string;
    roleName: string;
}

// Add interface for unassigned user type
interface UnassignedUserType {
    userId: number;
    userName: string;
}

export default function DepartmentsPage() {
    const { status } = useAuth();
    const { data: session } = useSession();
    const [data, setData] = useState([])
    const [modalCreate, setModalCreate] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [editingDepartment, setEditingDepartment] = useState<any>(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const { showSuccess, showError } = useAntdMessage();
    const [departmentMembers, setDepartmentMembers] = useState<DepartmentUserType[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<DepartmentUserType | null>(null);
    const [roleForm] = Form.useForm();
    const [availableRoles, setAvailableRoles] = useState<RoleType[]>([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [unassignedUsers, setUnassignedUsers] = useState<UnassignedUserType[]>([]);
    const [unassignedUsersLoading, setUnassignedUsersLoading] = useState(false);
    const [selectedUnassignedUser, setSelectedUnassignedUser] = useState<number | null>(null);
    const [addMemberForm] = Form.useForm();

    const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void, confirm: () => void) => {
        clearFilters();
        setSearchText('');
        setSearchedColumn('');
        confirm();
    };

    const getColumnSearchProps = (dataIndex: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, confirm)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value: string, record: any) => {
            if (!value || value.trim() === '') {
                return true;
            }
            
            if (!record[dataIndex]) {
                return false;
            }

            return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        },
        filteredValue: searchedColumn === dataIndex ? [searchText] : null,
    });

    const fetchData = async () => {
        setTableLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            })
            setData(response.data)
        } finally {
            setTableLoading(false);
        }
    }

    async function uploadToCloudinary(file: File, type: 'avatar' | 'banner', departmentName: string): Promise<string> {
        if (!file) throw new Error('No file provided');
        if (!departmentName) throw new Error('Department name is required');

        const formattedName = departmentName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');

        const timestamp = new Date().getTime();
        const publicId = `departments/${type}/${formattedName}_${timestamp}`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', type === 'banner' ? 'upload_banner' : 'upload_poster');
        formData.append('public_id', publicId);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );
            const data = await response.json();
            if (!data.secure_url) throw new Error('Upload failed');
            return data.secure_url;
        } catch (error) {
            console.error(`Failed to upload ${type}:`, error);
            throw new Error(`Failed to upload ${type}`);
        }
    }

    const handleCreate = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            console.log('Form values:', values);
            
            let avatarUrl = values.poster;
            let bannerUrl = values.banner;

            if (avatarUrl instanceof File) {
                avatarUrl = await uploadToCloudinary(avatarUrl, 'avatar', values.name);
            }
            if (bannerUrl instanceof File) {
                bannerUrl = await uploadToCloudinary(bannerUrl, 'banner', values.name);
            }

            const payload = {
                name: values.name,
                code: values.code,
                description: values.description,
                avatarUrl,
                bannerUrl
            };
            console.log('API payload:', payload);

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/departments`, payload, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            showSuccess("Department created successfully!");
            setModalCreate(false);
            form.resetFields();
            fetchData();
        } catch (err: any) {
            console.error("Failed to create department:", err);
            showError(err.response?.data?.message || "Failed to create department");
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = async (record: any) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/departments/detail/${record.id}`,
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            const detail = response.data;
            setEditingDepartment(detail);

            // Set initial values including the image URLs
            const initialValues = {
                name: detail.name,
                code: detail.code,
                description: detail.description,
                poster: detail.avatarUrl || null,  // Ensure we pass null if no URL exists
                banner: detail.bannerUrl || null   // Ensure we pass null if no URL exists
            };
            
            editForm.setFieldsValue(initialValues);
            setEditModalOpen(true);
        } catch (err) {
            showError('Failed to load department details');
        } finally {
            setLoading(false);
        }
    };
    const handleUpdate = async () => {
        try {
            setLoading(true);
            const values = await editForm.validateFields();
            console.log('Form values:', values);
            
            let avatarUrl = values.poster;
            let bannerUrl = values.banner;

            if (avatarUrl instanceof File) {
                avatarUrl = await uploadToCloudinary(avatarUrl, 'avatar', values.name);
            }
            if (bannerUrl instanceof File) {
                bannerUrl = await uploadToCloudinary(bannerUrl, 'banner', values.name);
            }

            const payload = {
                name: values.name,
                code: values.code,
                description: values.description,
                avatarUrl,
                bannerUrl
            };
            console.log('API payload:', payload);

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/departments/update/${editingDepartment.id}`, payload, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            showSuccess("Department updated successfully!");
            setEditModalOpen(false);
            editForm.resetFields();
            setEditingDepartment(null);
            fetchData();
        } catch (err: any) {
            console.error("Failed to update department:", err);
            showError(err.response?.data?.message || "Failed to update department");
        } finally {
            setLoading(false);
        }
    };
    const fetchAvailableRoles = async () => {
        try {
            setRolesLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/userdepartmentrole`,
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            setAvailableRoles(response.data);
        } catch (error) {
            console.error('Error fetching available roles:', error);
            showError('Failed to load available roles');
        } finally {
            setRolesLoading(false);
        }
    };
    const fetchDepartmentMembers = async (departmentId: number) => {
        try {
            setMembersLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/userdepartmentrole/${departmentId}/assigned-users`,
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            setDepartmentMembers(response.data);
        } catch (error) {
            console.error('Error fetching department members:', error);
            showError('Failed to load department members');
        } finally {
            setMembersLoading(false);
        }
    };
    const fetchDepartmentDetail = async (id: number) => {
        try {
            setDetailLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/departments/detail/${id}`,
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            setSelectedDepartment(response.data);
            setIsDetailModalOpen(true);
            // Fetch members when opening detail modal
            fetchDepartmentMembers(id);
            // Also fetch available roles
            fetchAvailableRoles();
        } catch (error) {
            console.error('Error fetching department details:', error);
            showError('Failed to load department details');
        } finally {
            setDetailLoading(false);
        }
    };
    const handleView = (record: any) => {
        fetchDepartmentDetail(record.id);
    };
    const handleDelete = async (record: any) => {
        try {
            setLoading(true);
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/departments/update-status/${record.id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            showSuccess("Department deleted successfully!");
            fetchData();
        } catch (err: any) {
            console.error("Failed to update department status:", err);
            showError(err.response?.data?.message || "Failed to update department status");
        } finally {
            setLoading(false);
        }
    };
    const handleEditRole = (user: DepartmentUserType) => {
        setSelectedUser(user);
        roleForm.setFieldsValue({ role: user.roleName });
        setEditRoleModalOpen(true);
    };
    const updateUserRole = async () => {
        try {
            if (!selectedUser || !selectedDepartment) {
                showError("Missing user or department information");
                return;
            }
            
            setLoading(true);
            const values = await roleForm.validateFields();
            console.log(selectedUser.userId, selectedDepartment.id, values.role);
            
            // Truyền tham số qua query parameters
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/userdepartmentrole/update-role?userId=${selectedUser.userId}&departmentId=${selectedDepartment.id}&departmentRoleId=${values.role}`,
                {}, // Empty body
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            
            showSuccess("Role updated successfully!");
            setEditRoleModalOpen(false);
            fetchDepartmentMembers(selectedDepartment.id); // Refresh the list
        } catch (err: any) {
            console.error("Failed to update role:", err);
            showError(err.response?.data?.message || "Failed to update role");
        } finally {
            setLoading(false);
        }
    };
    const fetchUnassignedUsers = async (departmentId: number) => {
        try {
            setUnassignedUsersLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/userdepartmentrole/${departmentId}/unassigned-users`,
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            setUnassignedUsers(response.data);
        } catch (error) {
            console.error('Error fetching unassigned users:', error);
            showError('Failed to load unassigned users');
        } finally {
            setUnassignedUsersLoading(false);
        }
    };
    const handleAddMember = () => {
        if (!selectedDepartment) return;
        
        // Reset form and fetch unassigned users
        addMemberForm.resetFields();
        setSelectedUnassignedUser(null);
        fetchUnassignedUsers(selectedDepartment.id);
        setAddMemberModalOpen(true);
    };
    const submitAddMember = async () => {
        try {
            if (!selectedDepartment || !selectedUnassignedUser) {
                showError("Please select a user and role");
                return;
            }

            setLoading(true);
            const values = await addMemberForm.validateFields();
            
            // Call API to add member with role
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/userdepartmentrole`,
                {
                    userId: selectedUnassignedUser,
                    departmentId: selectedDepartment.id,
                    departmentRoleId: values.role
                },
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            
            showSuccess("Member added successfully!");
            setAddMemberModalOpen(false);
            fetchDepartmentMembers(selectedDepartment.id); // Refresh members list
        } catch (err: any) {
            console.error("Failed to add member:", err);
            showError(err.response?.data?.message || "Failed to add member");
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteMember = async (user: DepartmentUserType) => {
        try {
            if (!selectedDepartment) return;
            
            setLoading(true);
            
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/userdepartmentrole/remove-user-from-department?userId=${user.userId}&departmentId=${selectedDepartment.id}`,
                {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                }
            );
            
            showSuccess("Member removed successfully!");
            fetchDepartmentMembers(selectedDepartment.id); // Refresh members list
        } catch (err: any) {
            console.error("Failed to remove member:", err);
            showError(err.response?.data?.message || "Failed to remove member");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData()
    }, [session])
    if (status === "loading") {
        return <Loading />;
    }
    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            ...getColumnSearchProps('code'),
            render: (text: string, record: any) => (
                <a onClick={() => handleView(record)}>{text}</a>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm
                        title="Delete department"
                        description={`Are you sure to delete ${record.name}?`}
                        onConfirm={() => handleDelete(record)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button type="link" danger>Delete</Button>
                    </Popconfirm>
                </div>
            )
        }
    ]

    const memberColumns = [
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Role',
            dataIndex: 'roleName',
            key: 'roleName',
        },
        {
            title: '',
            key: 'actions',
            render: (_: any, record: DepartmentUserType) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="link" onClick={() => handleEditRole(record)}>
                        Edit Role
                    </Button>
                    <Popconfirm
                        title="Remove member"
                        description={`Are you sure to remove ${record.userName} from this department?`}
                        onConfirm={() => handleDeleteMember(record)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button type="link" danger>Remove</Button>
                    </Popconfirm>
                </div>
            )
        }
    ];
    const unassignedUserColumns = [
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: UnassignedUserType) => (
                <Radio 
                    checked={selectedUnassignedUser === record.userId}
                    onChange={() => setSelectedUnassignedUser(record.userId)}
                />
            )
        }
    ];

    const getTabItems = () => {
        if (!selectedDepartment) return [];
        
        return [
            {
                key: 'info',
                label: 'Information',
                children: (
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div>
                                <strong>Code:</strong> {selectedDepartment.code}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <strong>Name:</strong> {selectedDepartment.name}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <strong>Description:</strong>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {selectedDepartment.description }
                                </div>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <strong>Created At:</strong>{' '}
                                {new Date(selectedDepartment.createdAt).toLocaleString()}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <strong>Updated At:</strong>{' '}
                                {new Date(selectedDepartment.updatedAt).toLocaleString()}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div>
                                <strong>Avatar:</strong>
                                <div style={{ marginTop: 8 }}>
                                    <img
                                        src={selectedDepartment.avatarUrl}
                                        alt="Avatar"
                                        style={{
                                            width: '100%',
                                            maxWidth: 200,
                                            height: 'auto',
                                            borderRadius: 4
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <strong>Banner:</strong>
                                <div style={{ marginTop: 8 }}>
                                    <img
                                        src={selectedDepartment.bannerUrl}
                                        alt="Banner"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: 4
                                        }}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                )
            },
            {
                key: 'members',
                label: 'Members',
                children: (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <Button type="primary" onClick={handleAddMember}>
                                Add Member
                            </Button>
                        </div>
                        <Table 
                            columns={memberColumns}
                            dataSource={departmentMembers}
                            loading={membersLoading}
                            rowKey="userId"
                        />
                    </>
                )
            }
        ];
    };

    return (
        <DashboardLayout>
            <h1>Departments</h1>
            <Button type="primary" onClick={() => setModalCreate(true)} style={{ marginBottom: 16 }}>
                Create
            </Button>
            <Table columns={columns} dataSource={data} loading={tableLoading}  />
            <Modal
                title="Create Department"
                open={modalCreate}
                onCancel={() => { setModalCreate(false); form.resetFields(); }}
                onOk={handleCreate}
                confirmLoading={loading}
                okText="Create"
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input name!' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please input code!' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input description!' }]}>
                                <Input.TextArea rows={10} placeholder="Enter department description" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="poster" label="Avatar" rules={[{ required: true, message: 'Please upload avatar!' }]}>
                                <ImageUpload type="AVATAR" height={150} />
                            </Form.Item>
                            <Form.Item name="banner" label="Banner" rules={[{ required: true, message: 'Please upload banner!' }]}>
                                <ImageUpload type="BANNER" height={150} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            <Modal
                title="Edit Department"
                open={editModalOpen}
                onCancel={() => { setEditModalOpen(false); setEditingDepartment(null); editForm.resetFields(); }}
                onOk={handleUpdate}
                confirmLoading={loading}
                okText="Update"
                width={800}
                style={{ top: 20 }}
            >
                <Form form={editForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input name!' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please input code!' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input description!' }]}>
                                <Input.TextArea rows={10} placeholder="Enter department description" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="poster" label="Avatar" rules={[{ required: true, message: 'Please upload avatar!' }]}>
                                <ImageUpload type="AVATAR" height={150} />
                            </Form.Item>
                            <Form.Item name="banner" label="Banner" rules={[{ required: true, message: 'Please upload banner!' }]}>
                                <ImageUpload type="BANNER" height={150} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
            <Modal
                title="Department Details"
                open={isDetailModalOpen}
                onCancel={() => {
                    setIsDetailModalOpen(false);
                    setSelectedDepartment(null);
                    setDepartmentMembers([]);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setIsDetailModalOpen(false);
                        setSelectedDepartment(null);
                        setDepartmentMembers([]);
                    }}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {detailLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        Loading...
                    </div>
                ) : selectedDepartment && (
                    <Tabs defaultActiveKey="info" items={getTabItems()} />
                )}
            </Modal>
            <Modal
                title="Edit User Role"
                open={editRoleModalOpen}
                onCancel={() => {
                    setEditRoleModalOpen(false);
                    setSelectedUser(null);
                    roleForm.resetFields();
                }}
                onOk={updateUserRole}
                confirmLoading={loading}
                centered
            >
                <Form form={roleForm} layout="vertical">
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select loading={rolesLoading}>
                            {availableRoles.map(role => (
                                <Select.Option key={role.id} value={role.id}>
                                    {role.name} - {role.description}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Add Department Member"
                open={addMemberModalOpen}
                onCancel={() => {
                    setAddMemberModalOpen(false);
                    setSelectedUnassignedUser(null);
                }}
                onOk={submitAddMember}
                confirmLoading={loading}
                width={800}
            >
                <div style={{ marginBottom: 16 }}>
                    <h3>Select a User</h3>
                    <Table
                        columns={unassignedUserColumns}
                        dataSource={unassignedUsers}
                        loading={unassignedUsersLoading}
                        rowKey="userId"
                        pagination={{ pageSize: 5 }}
                        size="small"
                    />
                </div>
                
                <Form form={addMemberForm} layout="vertical">
                    <Form.Item
                        name="role"
                        label="Assign Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select loading={rolesLoading}>
                            {availableRoles.map(role => (
                                <Select.Option key={role.id} value={role.id}>
                                    {role.name} - {role.description}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    )
}