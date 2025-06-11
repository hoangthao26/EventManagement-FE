'use client';

import { useState, ChangeEvent } from 'react';
import { Card, Input, Button, Descriptions, Typography, Space } from 'antd';
import { SearchOutlined, UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { Participant } from '../model/types';
import { searchParticipant, checkInParticipant } from '../model/api';
import { format } from 'date-fns';
import { QRScanner } from './QRScanner';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';

const { Title, Text } = Typography;

interface CheckInFormProps {
    eventId: number;
}

export function CheckInForm({ eventId }: CheckInFormProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const { showSuccess, showError, showWarning } = useAntdMessage();

    const handleSearch = async () => {
        if (!email) {
            showWarning('Please enter an email address');
            return;
        }

        setLoading(true);
        try {
            const result = await searchParticipant(eventId, email);
            if (result) {
                setParticipant(result);
            }
        } catch (error) {
            if (error instanceof Error) {
                showError(error.message);
            } else {
                showError('An unexpected error occurred');
            }
            setParticipant(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!participant) return;

        setCheckingIn(true);
        try {
            await checkInParticipant(eventId, participant.email);
            // Refetch lại participant sau khi check-in
            const updated = await searchParticipant(eventId, participant.email);
            setParticipant(updated);
            showSuccess('Check-in successful');
        } catch (error) {
            showError('Error during check-in');
        } finally {
            setCheckingIn(false);
        }
    };

    const handleQRSuccess = () => {
        // Refresh participant data after successful QR check-in
        if (participant) {
            handleSearch();
        }
    };

    return (
        <div>

            <Card>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div style={{ display: 'flex', width: '100%' }}>
                        <Input.Search
                            placeholder="Enter participant email"
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            onSearch={handleSearch}
                            enterButton={<span><SearchOutlined /> Search</span>}
                            loading={loading}
                            prefix={<MailOutlined />}
                            style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, height: 44 }}
                            size="large"
                        />

                    </div>

                    {participant && (
                        <Card>
                            <Descriptions title="Participant Information" bordered>
                                <Descriptions.Item label="Name">
                                    <Space>
                                        <UserOutlined />
                                        {participant.name}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <Space>
                                        <MailOutlined />
                                        {participant.email}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Event">
                                    {participant.eventName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Text strong type={participant.registrationStatus === 'ATTENDED' ? 'success' : 'warning'}>
                                        {participant.registrationStatus}
                                    </Text>
                                </Descriptions.Item>
                                {participant.checkTime && (
                                    <Descriptions.Item label="Check-in Time">
                                        {format(new Date(participant.checkTime), 'PPp')}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {participant.registrationStatus !== 'ATTENDED' && (
                                <Button
                                    type="primary"
                                    block
                                    style={{ marginTop: 16 }}
                                    onClick={handleCheckIn}
                                    loading={checkingIn}
                                >
                                    Confirm Check-in
                                </Button>
                            )}
                        </Card>
                    )}
                </Space>
            </Card>
        </div>
    );
} 