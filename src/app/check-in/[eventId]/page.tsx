'use client';

import { CheckInForm } from '@/features/check-in/ui/CheckInForm';
import { QRScanner } from '@/features/check-in/ui/QRScanner';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import { use, useEffect, useState } from 'react';
import { Button, Space, Card } from 'antd';
import { QrcodeOutlined, ScanOutlined } from '@ant-design/icons';
import Loading from '@/shared/ui/Loading';
import { useAuth } from '@/features/auth/model/useAuth';

interface CheckInEventPageProps {
    params: Promise<{
        eventId: string;
    }>;
}

export default function CheckInEventPage({ params }: CheckInEventPageProps) {
    const resolvedParams = use(params);
    const eventId = parseInt(resolvedParams.eventId);
    const [mode, setMode] = useState<'manual' | 'qr'>('manual');
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
        <DashboardLayout>
            <div style={{ padding: '16px' }}>
                <Card>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Space>
                            <Button
                                type={mode === 'manual' ? 'primary' : 'default'}
                                icon={<QrcodeOutlined />}
                                onClick={() => setMode('manual')}
                            >
                                Manual Check-in
                            </Button>
                            <Button
                                type={mode === 'qr' ? 'primary' : 'default'}
                                icon={<ScanOutlined />}
                                onClick={() => setMode('qr')}
                            >
                                QR Check-in
                            </Button>
                        </Space>

                        {mode === 'manual' ? (
                            <CheckInForm eventId={eventId} />
                        ) : (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '300px'
                            }}>
                                <QRScanner eventId={eventId} />
                            </div>
                        )}
                    </Space>
                </Card>
            </div>
        </DashboardLayout>
    );
} 