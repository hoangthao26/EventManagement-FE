"use client";

import React from 'react';
import { Layout, Avatar, Dropdown, Badge, Input, Space, Button } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    SettingOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';

const { Header } = Layout;
const { Search } = Input;

interface NavbarProps {
    showSearch?: boolean;
    onSearch?: (value: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ showSearch = false, onSearch }) => {
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

    return (
        <Header
            style={{
                padding: '0 24px',
                background: '#fff',
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
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {showSearch && (
                    <Search
                        placeholder="Search events..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={onSearch}
                        style={{ maxWidth: 500 }}
                    />
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {pathname === '/' && (
                    <>
                        {(isStudent || isLecturer) && (
                            <Button type="default" onClick={() => router.push('/registered-events')}>
                                Registered Event
                            </Button>
                        )}
                        {isLecturer && isHead && (
                            <Button type="primary" onClick={() => router.push('/organizer/create')}>
                                Create Event
                            </Button>
                        )}
                    </>
                )}
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
    );
}; 