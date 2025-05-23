"use client";

import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Input, Space, Button } from 'antd';
import {
    UserOutlined, LogoutOutlined,
    BellOutlined, SettingOutlined,
    SearchOutlined, CalendarOutlined
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { Search } = Input;

interface HomeLayoutProps {
    children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
    const { data: session } = useSession();
    const { session: authSession } = useAuth();
    const router = useRouter();

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
            <Header style={{
                padding: '0 24px',
                background: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1
                        style={{
                            margin: 0,
                            marginRight: 24,
                            cursor: 'pointer',
                            color: '#ff8533',
                            transition: 'color 0.3s'
                        }}
                        onClick={() => router.push('/')}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ffa366'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#ff8533'}
                    >
                        FPT Events
                    </h1>
                    <Search
                        placeholder="Tìm kiếm sự kiện..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        style={{ width: 400 }}
                        onSearch={onSearch}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginRight: 20 }}>
                    {/* My Events */}
                    {(authSession?.user?.roles?.includes('STUDENT') || authSession?.user?.roles?.includes('LECTURER')) && (
                        <Button
                            type="primary"
                            icon={<CalendarOutlined />}
                            onClick={() => router.push('/my-events')}
                            style={{
                                marginRight: 20,
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
                    <Dropdown
                        menu={{ items: notificationItems }}
                        placement="bottomRight"
                        arrow
                        trigger={['click']}
                    >
                        <Badge count={3} size="small">
                            <BellOutlined style={{ fontSize: 18, padding: '0 12px', cursor: 'pointer' }} />
                        </Badge>
                    </Dropdown>

                    {/* Profile avatar */}
                    <Dropdown
                        menu={{ items: profileItems }}
                        placement="bottomRight"
                        arrow
                        trigger={['click']}
                    >
                        <div style={{ marginLeft: 12, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Avatar
                                size="small"
                                icon={<UserOutlined />}
                                src={session?.user?.image}
                                style={{ marginRight: 8 }}
                            />
                            <span>{session?.user?.name}</span>
                        </div>
                    </Dropdown>
                </div>
            </Header>

            <Content style={{
                margin: '24px 16px',
                padding: 24,
                background: '#fff',
                minHeight: 280,
            }}>
                {children}
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                FPT Events ©{new Date().getFullYear()} Created by FPT University
            </Footer>
        </Layout>
    );
} 