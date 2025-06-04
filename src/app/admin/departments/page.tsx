"use client"

import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import { Table, Button, Modal, Form, Input, message} from "antd";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import axios from "axios";
import Loading from "@/shared/ui/Loading";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/features/event-management/create/ui/ImageUpload";

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
    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: 'Updated At',
            dataIndex: 'updated_at',
            key: 'updated_at',
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
        const publicId = `${type}/${formattedName}_${timestamp}`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', type === 'avatar' ? 'upload_avatar' : 'upload_banner');
        formData.append('public_id', publicId);
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );
        const data = await response.json();
        if (!data.secure_url) throw new Error('Upload failed');
        return data.secure_url;
    }

    const handleCreate = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            let avatarUrl = values.avatarUrl;
            let bannerUrl = values.bannerUrl;
            if (avatarUrl instanceof File) {
                avatarUrl = await uploadToCloudinary(avatarUrl, 'avatar', values.name);
            }
            if (bannerUrl instanceof File) {
                bannerUrl = await uploadToCloudinary(bannerUrl, 'banner', values.name);
            }
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/departments/create`, {
                ...values,
                avatarUrl,
                bannerUrl,
            }, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            message.success("Department created successfully!");
            setModalCreate(false);
            form.resetFields();
            fetchData();
        } catch (err) {
            message.error("Failed to create department");
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = (record: any) => {
        setEditingDepartment(record);
        editForm.setFieldsValue({
            name: record.name,
            code: record.code,
            avatarUrl: record.avatarUrl,
            bannerUrl: record.bannerUrl,
        });
        setEditModalOpen(true);
    };
    const handleUpdate = async () => {
        if (!editingDepartment) return;
        try {
            setLoading(true);
            const values = await editForm.validateFields();
            let avatarUrl = values.avatarUrl;
            let bannerUrl = values.bannerUrl;
            if (avatarUrl instanceof File) {
                avatarUrl = await uploadToCloudinary(avatarUrl, 'avatar', values.name);
            }
            if (bannerUrl instanceof File) {
                bannerUrl = await uploadToCloudinary(bannerUrl, 'banner', values.name);
            }
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/departments/update/${editingDepartment.id}`, {
                ...values,
                avatarUrl,
                bannerUrl,
            }, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            message.success("Department updated successfully!");
            setEditModalOpen(false);
            setEditingDepartment(null);
            editForm.resetFields();
            fetchData();
        } catch (err) {
            message.error("Failed to update department");
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
    return (
        <DashboardLayout>
            <h1>Departments</h1>
            <Button type="primary" onClick={() => setModalCreate(true)} style={{ marginBottom: 16 }}>
                Create
            </Button>
            <Table columns={columns} dataSource={data} loading={tableLoading} />
            <Modal
                title="Create Department"
                open={modalCreate}
                onCancel={() => { setModalCreate(false); form.resetFields(); }}
                onOk={handleCreate}
                confirmLoading={loading}
                okText="Create"
                style={{ top: 40 }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please input code!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="avatarUrl" label="Avatar" rules={[{ required: true, message: 'Please upload avatar!' }]}>
                        <ImageUpload type="POSTER" height={150} />
                    </Form.Item>
                    <Form.Item name="bannerUrl" label="Banner" rules={[{ required: true, message: 'Please upload banner!' }]}>
                        <ImageUpload type="BANNER" height={150} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Edit Department"
                open={editModalOpen}
                onCancel={() => { setEditModalOpen(false); setEditingDepartment(null); editForm.resetFields(); }}
                onOk={handleUpdate}
                confirmLoading={loading}
                okText="Update"
                style={{ top: 40 }}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please input code!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="avatarUrl" label="Avatar" rules={[{ required: true, message: 'Please upload avatar!' }]}>
                        <ImageUpload type="POSTER" height={150} />
                    </Form.Item>
                    <Form.Item name="bannerUrl" label="Banner" rules={[{ required: true, message: 'Please upload banner!' }]}>
                        <ImageUpload type="BANNER" height={150} />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    )
}