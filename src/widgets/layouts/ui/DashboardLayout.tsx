"use client";

import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Navbar } from '@/shared/ui/Navbar/ui/Navbar';
import { Sider } from '@/shared/ui/Sider/ui/Sider';

const { Content, Footer } = Layout;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsed={collapsed} />

            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Navbar/>

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