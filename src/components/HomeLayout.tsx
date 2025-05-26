"use client";

import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Input, Space, Button, Row, Col } from 'antd';
import {
    UserOutlined, LogoutOutlined, BellOutlined, 
    SettingOutlined, SearchOutlined, CalendarOutlined,
    FacebookOutlined, InstagramOutlined, YoutubeOutlined,
    MailOutlined, PhoneOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';

const { Header, Content, Footer } = Layout;
const { Text, Link: AntLink } = Typography;
const { Search } = Input;

interface HomeLayoutProps {
    children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
    // DEVELOPMENT BYPASS
    const mockSession = {
        user: {
            id: "1",
            name: "Test User",
            email: "test@fpt.edu.vn",
            image: "",
            roles: ["ADMIN", "LECTURER", "STUDENT"]
        }
    };

    // Original code
    // const { data: session } = useSession();
    // const { session: authSession } = useAuth();
    const router = useRouter();

    const session = mockSession;
    const authSession = { user: mockSession.user };

    // Profile dropdown menu items
    const profileItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: () => router.push('/profile'),
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => router.push('/settings'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => signOut({ callbackUrl: '/login' }),
        },
    ];

    // Notification dropdown items
    const notificationItems = [
        {
            key: 'notification1',
            label: 'New event created',
            onClick: () => { },
        },
        {
            key: 'notification2',
            label: 'Event updated',
            onClick: () => { },
        },
        {
            key: 'notification3',
            label: 'Event reminder',
            onClick: () => { },
        },
        {
            type: 'divider',
        },
        {
            key: 'viewAll',
            label: 'View all notifications',
            onClick: () => router.push('/notifications'),
        },
    ];

    const onSearch = (value: string) => {
        // Xử lý tìm kiếm ở đây
        console.log('Search value:', value);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Header */}
            <Header style={{
                padding: '0 24px',
                background: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#ff8533', borderRadius: '8px', padding: '6px', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </div>
                        <h1
                            style={{
                                margin: 0,
                                cursor: 'pointer',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}
                            onClick={() => router.push('/')}
                        >
                            FPT<span style={{ color: '#ff8533' }}>Events</span>
                        </h1>
                    </div>

                    {/* Search */}
                    <Search
                        placeholder="Tìm kiếm sự kiện..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        style={{ width: 400 }}
                        onSearch={onSearch}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {/* My Events Button */}
                    {(authSession?.user?.roles?.includes('STUDENT') || authSession?.user?.roles?.includes('LECTURER')) && (
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={() => router.push('/my-events')}
                            style={{
                                backgroundColor: '#ff8533',
                                borderColor: '#ff8533'
                            }}
                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.backgroundColor = '#ffa366';
                                e.currentTarget.style.borderColor = '#ffa366';
                            }}
                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.backgroundColor = '#ff8533';
                                e.currentTarget.style.borderColor = '#ff8533';
                            }}
                        >
                            My Events
                        </Button>
                    )}

                    {/* Notifications */}
                    <Dropdown menu={{ items: notificationItems }} placement="bottomRight" arrow trigger={['click']}>
                        <Badge count={3} size="small">
                            <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                        </Badge>
                    </Dropdown>

                    {/* Profile */}
                    <Dropdown menu={{ items: profileItems }} placement="bottomRight" arrow trigger={['click']}>
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar icon={<UserOutlined />} src={session?.user?.image} />
                            <span>{session?.user?.name}</span>
                        </div>
                    </Dropdown>
                </div>
            </Header>

            {/* Main Content */}
            <Content style={{
                margin: '24px auto',
                padding: '0 24px',
                maxWidth: 1200,
                width: '100%'
            }}>
                {children}
            </Content>

            {/* Footer */}
            <Footer style={{ 
                background: '#27272a',
                padding: '48px 24px 24px'
            }}>
                <Row gutter={[32, 32]} justify="space-between" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <Col xs={24} md={8}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                            <div style={{ background: '#ff8533', borderRadius: '8px', padding: '6px' }}>
                                <CalendarOutlined style={{ color: 'white', fontSize: '20px' }} />
                            </div>
                            <Text strong style={{ color: '#fff', fontSize: '20px' }}>
                                FPT<Text strong style={{ color: '#ff8533' }}>Events</Text>
                            </Text>
                        </div>
                        <Text style={{ color: '#e5e5e5', display: 'block', marginBottom: 24 }}>
                            Hệ thống quản lý sự kiện FPT University - nơi kết nối sinh viên, giảng viên 
                            với các sự kiện hội thảo, workshop và talkshow hấp dẫn.
                        </Text>
                        <Space size="large">
                            <FacebookOutlined style={{ color: '#fff', fontSize: 24 }} />
                            <InstagramOutlined style={{ color: '#fff', fontSize: 24 }} />
                            <YoutubeOutlined style={{ color: '#fff', fontSize: 24 }} />
                        </Space>
                    </Col>

                    <Col xs={24} md={8}>
                        <Text strong style={{ color: '#fff', fontSize: 18, display: 'block', marginBottom: 16 }}>
                            Liên hệ
                        </Text>
                        <Space direction="vertical" size="middle">
                            <Space>
                                <EnvironmentOutlined style={{ color: '#ff8533' }} />
                                <Text style={{ color: '#e5e5e5' }}>
                                    Lô E2a-7, Đường D1, Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức
                                </Text>
                            </Space>
                            <Space>
                                <PhoneOutlined style={{ color: '#ff8533' }} />
                                <Text style={{ color: '#e5e5e5' }}>(028) 7300 5588</Text>
                            </Space>
                            <Space>
                                <MailOutlined style={{ color: '#ff8533' }} />
                                <Text style={{ color: '#e5e5e5' }}>daihoc.hcm@fpt.edu.vn</Text>
                            </Space>
                        </Space>
                    </Col>
                </Row>

                <div style={{ 
                    marginTop: 48, 
                    paddingTop: 24, 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                }}>
                    <Text style={{ color: '#a3a3a3' }}>
                        © {new Date().getFullYear()} FPT Events. All rights reserved.
                    </Text>
                </div>
            </Footer>
        </Layout>
    );
}