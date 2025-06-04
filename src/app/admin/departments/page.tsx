"use client"

import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import { Table, Button, Modal, Form, Input, message, Row, Col, Space } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import axios from "axios";
import Loading from "@/shared/ui/Loading";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/features/event-management/create/ui/ImageUpload";
import { SearchOutlined } from "@ant-design/icons";

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
                <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
            )
        }
    ]

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
            message.success("Department created successfully!");
            setModalCreate(false);
            form.resetFields();
            fetchData();
        } catch (err: any) {
            console.error("Failed to create department:", err);
            message.error(err.response?.data?.message || "Failed to create department");
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = (record: any) => {
        setEditingDepartment(record);
        editForm.setFieldsValue({
            name: record.name,
            code: record.code,
            description: record.description,
            poster: record.avatarUrl,
            banner: record.bannerUrl,
        });
        setEditModalOpen(true);
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

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/departments/${editingDepartment.id}`, payload, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            message.success("Department updated successfully!");
            setEditModalOpen(false);
            editForm.resetFields();
            setEditingDepartment(null);
            fetchData();
        } catch (err: any) {
            console.error("Failed to update department:", err);
            message.error(err.response?.data?.message || "Failed to update department");
        } finally {
            setLoading(false);
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
        } catch (error) {
            console.error('Error fetching department details:', error);
            message.error('Failed to load department details');
        } finally {
            setDetailLoading(false);
        }
    };
    const handleView = (record: any) => {
        fetchDepartmentDetail(record.id);
    };
    useEffect(() => {
        fetchData()
    }, [session])
    if (status === "loading") {
        return <Loading />;
    }
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
                                <Input.TextArea rows={10} placeholder="Enter department description" />
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
                                <Input.TextArea rows={10} placeholder="Enter department description" />
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
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setIsDetailModalOpen(false);
                        setSelectedDepartment(null);
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
                )}
            </Modal>
        </DashboardLayout>
    )
}