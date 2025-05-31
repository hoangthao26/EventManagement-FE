"use client";

import React from 'react';
import { Layout, theme } from 'antd';
import { Navbar } from '@/shared/ui/Navbar/ui/Navbar';
import PageFooter from '@/shared/ui/Navbar/ui/Footer';

const { Content } = Layout;

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
            <Navbar />
                {children}
            <PageFooter />

        </Layout>
    );
}