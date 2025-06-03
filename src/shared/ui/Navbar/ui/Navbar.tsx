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
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';

const { Header, Content, Footer } = Layout;
const { Text, Link: AntLink } = Typography;
const { Search } = Input;

interface NavbarProps {
    showSearch?: boolean;
    onSearch?: (value: string) => void;
    children: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ showSearch = false, onSearch, children }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { session: authSession, logout } = useAuth();
    const userRoles = authSession?.user?.roles || [];
    const userDepartmentRoles = authSession?.user?.userDepartmentRoles || [];
    const isStudent = userRoles.includes('STUDENT');
    const isLecturer = userRoles.includes('LECTURER');
    const isHead = userDepartmentRoles.some(role => role.roleName === 'HEAD');

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
            onClick: () => logout(),
        },
    ];

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

    const menuItems = [
        {
            key: '/events',
            label: 'Events',
            onClick: () => router.push('/events')
        },
        {
            key: '/departments',
            label: 'Departments',
            onClick: () => router.push('/departments')
        },
        {
            key: '/about',
            label: 'About Us',
            onClick: () => router.push('/about')
        },
    ];

    return (
        <Header style={{
            padding: '0 50px',
            width: '100%',
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

                {/* Navigation Menu */}
                <Menu
                    mode="horizontal"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    style={{
                        border: 'none',
                        minWidth: '300px', // Add minimum width
                        flex: 'none',     // Remove flex to prevent shrinking
                    }}
                />

                {/* Search */}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {pathname === '/' && (
                    <>
                        {(isStudent || isLecturer) && (
                            <Button type="default" onClick={() => router.push('/registered-events')}>
                                Registered Events
                            </Button>
                        )}
                        {isLecturer && isHead && (
                            <Button type="primary" onClick={() => router.push('/organizer/create')}>
                                Create Event
                            </Button>
                        )}
                    </>
                )}

                {/* Notifications */}
                {/* Profile */}
                <Dropdown menu={{ items: profileItems }} placement="bottomRight" arrow trigger={['click']}>
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
    );
};