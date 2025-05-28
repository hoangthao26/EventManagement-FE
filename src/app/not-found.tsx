"use client";

import React from 'react';
import { Result, Button, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { HomeOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/features/auth/model/useAuth';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import Loading from '@/shared/ui/Loading';
import { useEffect } from 'react';

const { Title, Text } = Typography;

export default function NotFound() {
    const router = useRouter();
    const { session, status } = useAuth();


    useEffect(() => {
        if (status === "unauthenticated") {
            window.location.href = "/login";
        }
    }, [status]);

    if (status === "loading") {
        return <Loading />;
    }
    return (
        <HomeLayout>
            <div className="min-h-screen flex items-center justify-center">
                <Result
                    status="404"
                    title={<Title level={1} style={{ fontSize: '64px' }}>404</Title>}
                    subTitle={
                        <div className="text-center">
                            <Title level={3}>Trang không tồn tại</Title>
                            <Text type="secondary">
                                Trang bạn đang tìm kiếm không tồn tại!
                            </Text>
                        </div>
                    }
                    extra={
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Space wrap>
                                <Button
                                    type="primary"
                                    icon={<HomeOutlined />}
                                    onClick={() => router.push('/')}
                                >
                                    Về trang chủ
                                </Button>
                                <Button
                                    icon={<SearchOutlined />}
                                    onClick={() => router.push('/events')}
                                >
                                    Các sự kiện
                                </Button>
                                <Button
                                    type="text"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => router.back()}
                                >
                                    Quay lại
                                </Button>
                            </Space>
                        </Space>
                    }
                />
            </div>
        </HomeLayout>
    );
}