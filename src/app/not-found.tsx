"use client";

import React, { useEffect } from 'react';
import { Result, Button, Space } from 'antd';
import { useRouter } from 'next/navigation';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import { useAuth } from '@/features/auth/model/useAuth';
import Loading from '@/shared/ui/Loading';

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

        <Result
            status="404"
            title="404"
            subTitle="Xin lỗi, trang bạn đang tìm kiếm không tồn tại."
            extra={
                <Space>
                    <Button onClick={() => router.back()}>
                        Quay lại
                    </Button>
                    <Button type="primary" onClick={() => router.push('/')}>
                        Về trang chủ
                    </Button>
                </Space>
            }
        />

    );
} 