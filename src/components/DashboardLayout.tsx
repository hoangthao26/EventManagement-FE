"use client";

import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, theme } from 'antd';
import {
    UserOutlined, LogoutOutlined,
    BellOutlined, SettingOutlined,
    MenuFoldOutlined, MenuUnfoldOutlined,
    CalendarOutlined, TeamOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { data: session } = useSession();
    const { session: authSession } = useAuth();
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

    // Menu items based on user role
    const getMenuItems = () => {
        const items = [];

        // Add menu items based on role
        if (authSession?.user?.roles?.includes('ADMIN')) {
            items.push(
                {
                    key: '/admin',
                    icon: <TeamOutlined />,
                    label: 'Admin Dashboard',
                    onClick: () => router.push('/admin'),
                },
                {
                    key: '/admin/deparments',
                    icon: <TeamOutlined />,
                    label: 'Departments',
                    onClick: () => router.push('/admin/departments'),
                }
            );
        } else {
            // Home chỉ hiển thị cho LECTURER và STUDENT
            items.push(
                {
                    key: '/',
                    icon: <DashboardOutlined />,
                    label: 'Home',
                    onClick: () => router.push('/'),
                }
            );
        }

        if (authSession?.user?.roles?.includes('LECTURER')) {
            items.push(
                {
                    key: '/organizer',
                    icon: <TeamOutlined />,
                    label: 'Organizer Dashboard',
                    onClick: () => router.push('/organizer'),
                }
            );
        }

        // My Events chỉ hiển thị cho STUDENT và LECTURER
        if (authSession?.user?.roles?.includes('STUDENT') || authSession?.user?.roles?.includes('LECTURER')) {
            items.push(
                {
                    key: '/my-events',
                    icon: <CalendarOutlined />,
                    label: 'My Events',
                    onClick: () => router.push('/my-events'),
                }
            );
        }

        return items;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
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
                }}
            >
                <div className="logo" style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
                    onClick={() => router.push('/')}
                >
                    <h1 style={{
                        color: '#fff',
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {collapsed ? 'FE' : 'FPT Events'}
                    </h1>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={getMenuItems()}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header style={{
                    padding: '0 24px',
                    background: colorBgContainer,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: () => setCollapsed(!collapsed),
                        style: { fontSize: '18px', cursor: 'pointer' }
                    })}
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

                <Content style={{
                    margin: '24px 16px',
                    padding: 24,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    minHeight: 280,
                }}>
                    {children}
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    FPT Events ©{new Date().getFullYear()} Created by FPT University
                </Footer>
            </Layout>
        </Layout>
    );
} 