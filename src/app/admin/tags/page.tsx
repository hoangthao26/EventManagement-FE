"use client"

import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import { Table, Button, Modal, Form, Input, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import axios from "axios";
import Loading from "@/shared/ui/Loading";
import { useSession } from "next-auth/react";
import { SearchOutlined, EditOutlined, DeleteOutlined, TagOutlined } from "@ant-design/icons";
import { useAntdMessage } from "@/shared/lib/hooks/useAntdMessage";
import { Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
const { Search } = Input;

interface TagType {
    id: number;
    name: string;
    description: string;
}

type DataIndex = keyof TagType;

export default function TagsPage() {
    const { status } = useAuth();
    const { data: session } = useSession();
    const [data, setData] = useState<TagType[]>([]);
    const [modalCreate, setModalCreate] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [editingTag, setEditingTag] = useState<TagType | null>(null);
    const [searchText, setSearchText] = useState('');
    const { showSuccess, showError } = useAntdMessage();

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: TagType) => (
                <div>
                    <Button type="link" onClick={() => handleEdit(record)}><EditOutlined /></Button>
                    <Popconfirm
                        title="Delete tag"
                        description={`Are you sure to delete ${record.name}?`}
                        onConfirm={() => handleDisable(record)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button type="link" danger><DeleteOutlined /></Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    const fetchData = async () => {
        setTableLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags/active`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            });
            setData(response.data);
        } finally {
            setTableLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tags`, {
                name: values.name,
                description: values.description
            }, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            showSuccess("Tag created successfully!");
            setModalCreate(false);
            form.resetFields();
            fetchData();
        } catch (err: any) {
            console.error("Failed to create tag:", err);
            showError(err.response?.data?.message || "Failed to create tag");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record: TagType) => {
        setEditingTag(record);
        editForm.setFieldsValue({
            name: record.name,
            description: record.description,
        });
        setEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const values = await editForm.validateFields();
            
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/tags/${editingTag?.id}`, {
                name: values.name,
                description: values.description
            }, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            showSuccess("Tag updated successfully!");
            setEditModalOpen(false);
            editForm.resetFields();
            setEditingTag(null);
            fetchData();
        } catch (err: any) {
            console.error("Failed to update tag:", err);
            showError(err.response?.data?.message || "Failed to update tag");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async (record: TagType) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/tags/${record.id}`, {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            showSuccess("Tag deleted successfully!");
            fetchData();
        } catch (err: any) {
            console.error("Failed to delete tag:", err);
            showError(err.response?.data?.message || "Failed to delete tag");
        }
    };

    useEffect(() => {
        fetchData();
    }, [session]);

    if (status === "loading") {
        return <Loading />;
    }

    // Filter data based on search text
    const filteredData = data.filter(item => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();
        return item.name.toLowerCase().includes(searchLower);
    });

    return (
        <DashboardLayout>
            <h1>Tags</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Button type="primary" onClick={() => setModalCreate(true)}>
                    Create
                </Button>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Search
                        placeholder="Search by tag name"
                        value={searchText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                        onSearch={(value: string) => setSearchText(value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                </div>
            </div>
            <Table columns={columns} dataSource={filteredData} loading={tableLoading} />
            
            {/* Create Modal */}
            <Modal
                title="Create Tag"
                open={modalCreate}
                onCancel={() => { setModalCreate(false); form.resetFields(); }}
                onOk={handleCreate}
                confirmLoading={loading}
                okText="Create"
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input description!' }]}>
                        <Input.TextArea rows={6} placeholder="Enter tag description" allowClear />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Edit Tag"
                open={editModalOpen}
                onCancel={() => { setEditModalOpen(false); setEditingTag(null); editForm.resetFields(); }}
                onOk={handleUpdate}
                confirmLoading={loading}
                okText="Update"
                width={600}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input description!' }]}>
                        <Input.TextArea rows={6} placeholder="Enter tag description" allowClear />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
}
