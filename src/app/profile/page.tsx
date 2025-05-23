"use client";

import React from 'react';
import { Card, Avatar, Typography, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
    const { data: session } = useSession();

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <Card>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                src={session?.user?.image}
                            />
                            <Title level={2} style={{ marginTop: 16 }}>
                                {session?.user?.name}
                            </Title>
                        </div>

                        <div>
                            <Title level={4}>Thông tin cá nhân</Title>
                            <Space direction="vertical" size="middle">
                                <div>
                                    <Text strong>Email:</Text>
                                    <Text style={{ marginLeft: 8 }}>{session?.user?.email}</Text>
                                </div>
                                <div>
                                    <Text strong>Vai trò:</Text>
                                    <Space style={{ marginLeft: 8 }}>
                                        {session?.user?.roles?.map((role: string) => (
                                            <Tag color={
                                                role === 'ADMIN' ? 'red' :
                                                    role === 'LECTURER' ? 'blue' :
                                                        'green'
                                            } key={role}>
                                                {role}
                                            </Tag>
                                        ))}
                                    </Space>
                                </div>
                            </Space>
                        </div>
                    </Space>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage; 