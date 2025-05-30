"use client";

import React from 'react';
import { Layout, Menu } from 'antd';
import {
    CalendarOutlined,
    NotificationOutlined,
    TeamOutlined,
    DashboardOutlined,
    UserOutlined,
    UnorderedListOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/model/useAuth';

const { Sider: AntSider } = Layout;

interface SiderProps {
    collapsed: boolean;
}

export const Sider: React.FC<SiderProps> = ({ collapsed }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { session, hasRole } = useAuth();

    const getMenuItems = () => {
        const items = [];

        // Dashboard chỉ hiển thị cho ADMIN và LECTURER
        if (hasRole('ADMIN') || hasRole('LECTURER')) {
            items.push({
                key: '/admin',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                onClick: () => router.push('/admin'),
            },
            {
                key: '/departments',
                icon: <TeamOutlined />,
                label: 'Departments',
                onClick: () => router.push('/departments'),
            }
        );
        }

        // Events menu cho tất cả roles
        items.push({
            key: '/events',
            icon: <CalendarOutlined />,
            label: 'Events',
            onClick: () => router.push('/events'),
        });

        // Registered Events cho STUDENT và LECTURER
        if (hasRole('STUDENT') || hasRole('LECTURER')) {
            items.push({
                key: '/registered-events',
                icon: <CheckCircleOutlined />,
                label: 'Registered Events',
                onClick: () => router.push('/registered-events'),
            });
        }

        // My Events chỉ cho LECTURER
        if (hasRole('LECTURER')) {
            items.push({
                key: '/organizer/my-events',
                icon: <UnorderedListOutlined />,
                label: 'My Events',
                onClick: () => router.push('/organizer/my-events'),
            });
        }

        // Team menu chỉ cho ADMIN và LECTURER
        if (hasRole('ADMIN') || hasRole('LECTURER')) {
            items.push({
                key: '/team',
                icon: <TeamOutlined />,
                label: 'Team',
                onClick: () => router.push('/team'),
            });
        }

        // Profile menu cho tất cả roles
        items.push({
            key: '/profile',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: () => router.push('/profile'),
        });

        return items;
    };

    return (
        <AntSider
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
        </AntSider>
    );
}; 