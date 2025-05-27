"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, theme } from 'antd';
import {
    MenuFoldOutlined, MenuUnfoldOutlined,
    UserOutlined, LogoutOutlined,
    BellOutlined, CalendarOutlined,
    NotificationOutlined, SettingOutlined
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

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

    // Ẩn Sider nếu là trang home
    const showSider = pathname !== "/";

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            {showSider && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 1000,
                    }}
                >
                    <div style={{ height: 32, margin: 16, color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                        {collapsed ? 'FE' : 'FPT Events'}
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        items={[
                            {
                                key: '1',
                                icon: <CalendarOutlined />,
                                label: 'Events',
                                onClick: () => router.push('/events'),
                            },
                            {
                                key: '2',
                                icon: <NotificationOutlined />,
                                label: 'Notifications',
                                onClick: () => router.push('/notifications'),
                            },
                        ]}
                    />
                </Sider>
            )}

            <Layout style={{ marginLeft: showSider ? (collapsed ? 80 : 200) : 0, transition: 'all 0.2s' }}>
                {/* Header */}
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        position: 'sticky',
                        top: 0,
                        zIndex: 999,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                    }}
                >
                    {/* Left side of header */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: 18, padding: '0 24px', cursor: 'pointer' },
                        })}
                    </div>

                    {/* Right side of header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 20 }}>
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

                {/* Main content */}
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        minHeight: 280,
                    }}
                >
                    {children}
                </Content>

                {/* Footer */}
                <Footer
                    style={{
                        textAlign: 'center',
                        padding: '12px 50px',
                        color: 'rgba(0, 0, 0, 0.45)',
                        fontSize: 14,
                    }}
                >
                    FPT Event FE Created by Thao
                </Footer>
            </Layout>
        </Layout>
    );
} 