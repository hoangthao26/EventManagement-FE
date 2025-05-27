"use client";

import React from 'react';
import { Result, Button, Space } from 'antd';
import { useRouter } from 'next/navigation';


export default function NotFound() {
    const router = useRouter();

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