"use client";

import React, { useEffect } from 'react';
import { Card, Avatar, Typography, Space, Tag, Divider } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import { useRouter } from 'next/navigation';
import Loading from '@/shared/ui/Loading';
import { useAuth } from '@/features/auth/model/useAuth';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
    const { session, status } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return <Loading />;
    }

    return (
        <HomeLayout>
            <div style={{
                padding: '48px 24px',
                minHeight: 'calc(100vh - 64px)', // Adjust for header height
                background: '#f5f5f5'
            }}>
                <Card 
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {/* Profile Header */}
                        <div style={{ 
                            textAlign: 'center',
                        }}>
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={session?.user?.image}
                                style={{
                                    border: '4px solid #fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}
                            />
                            <Title level={2} style={{ 
                                marginTop: 24,
                                marginBottom: 8,
                                fontSize: '28px',
                                fontWeight: 600
                            }}>
                                {session?.user?.name}
                            </Title>
                        </div>

                        <Divider style={{ margin: '12px 0' }} />

                        {/* Profile Details */}
                        <div style={{ padding: '0 16px' }}>
                            <Title level={4} style={{
                                fontSize: '18px',
                                marginBottom: '24px',
                                color: '#1890ff'
                            }}>
                                Thông tin cá nhân
                            </Title>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 0'
                                }}>
                                    <MailOutlined style={{ 
                                        fontSize: '20px',
                                        color: '#1890ff',
                                        marginRight: '12px'
                                    }} />
                                    <div>
                                        <Text type="secondary" style={{ 
                                            display: 'block',
                                            fontSize: '12px'
                                        }}>
                                            Email
                                        </Text>
                                        <Text strong style={{ fontSize: '16px' }}>
                                            {session?.user?.email}
                                        </Text>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 0'
                                }}>
                                    <IdcardOutlined style={{ 
                                        fontSize: '20px',
                                        color: '#1890ff',
                                        marginRight: '12px'
                                    }} />
                                    <div>
                                        <Text type="secondary" style={{ 
                                            display: 'block',
                                            fontSize: '12px'
                                        }}>
                                            Vai trò
                                        </Text>
                                        <Space style={{ marginTop: '4px' }}>
                                            {session?.user?.roles?.map((role: string) => (
                                                <Tag 
                                                    key={role}
                                                    color={
                                                        role === 'ADMIN' ? 'red' :
                                                        role === 'LECTURER' ? 'blue' :
                                                        'green'
                                                    }
                                                    style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '4px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    {role}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </div>
                                </div>
                            </Space>
                        </div>
                    </Space>
                </Card>
            </div>
        </HomeLayout>
    );
};

export default ProfilePage;