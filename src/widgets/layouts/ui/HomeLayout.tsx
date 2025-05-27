"use client";

import React from 'react';
import { Layout, theme } from 'antd';
import { Navbar } from '@/shared/ui/Navbar/ui/Navbar';

const { Content, Footer } = Layout;

interface HomeLayoutProps {
    children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const handleSearch = (value: string) => {
        // Implement search functionality
        console.log('Searching for:', value);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Navbar showSearch={true} onSearch={handleSearch} />

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
    );
} 