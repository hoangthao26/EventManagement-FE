"use client"

import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import { Table, Button, Modal, Form, Input, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import axios from "axios";
import Loading from "@/shared/ui/Loading";
import { useSession } from "next-auth/react";
import { SearchOutlined } from "@ant-design/icons";
import { useAntdMessage } from "@/shared/lib/hooks/useAntdMessage";

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
    const [searchedColumn, setSearchedColumn] = useState('');
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const { showSuccess, showError } = useAntdMessage();

    const handleSearch = (selectedKeys: string[], confirm: () => void, dataIndex: keyof TagType) => {
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

    const getColumnSearchProps = (dataIndex: keyof TagType) => ({
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
        onFilter: (value: string, record: TagType) => {
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
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ...getColumnSearchProps('description'),
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: TagType) => (
                <div>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDisable(record)}>Delete</Button>
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

    return (
        <DashboardLayout>
            <h1>Tags</h1>
            <Button type="primary" onClick={() => setModalCreate(true)} style={{ marginBottom: 16 }}>
                Create
            </Button>
            <Table columns={columns} dataSource={data} loading={tableLoading} />
            
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
