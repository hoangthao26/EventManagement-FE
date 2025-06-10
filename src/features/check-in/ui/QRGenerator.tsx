'use client';

import { useState } from 'react';
import { Card, Input, Button, Form, message } from 'antd';
import { QRCodeSVG } from 'qrcode.react';

interface QRGeneratorProps {
    eventId: number;
}

export function QRGenerator({ eventId }: QRGeneratorProps) {
    const [email, setEmail] = useState('');
    const [qrValue, setQrValue] = useState('');

    const handleGenerate = () => {
        if (!email) {
            message.error('Please enter an email');
            return;
        }
        // Format: email,eventId
        const qrContent = `${email},${eventId}`;
        setQrValue(qrContent);
    };

    return (
        <Card title="QR Code Generator" style={{ maxWidth: 400, margin: '20px auto' }}>
            <Form layout="vertical">
                <Form.Item label="Email">
                    <Input
                        placeholder="Enter email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={handleGenerate}>
                        Generate QR Code
                    </Button>
                </Form.Item>
            </Form>

            {qrValue && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <QRCodeSVG
                        value={qrValue}
                        size={256}
                        level="H"
                        includeMargin={true}
                    />
                    <p style={{ marginTop: 10, wordBreak: 'break-all' }}>
                        QR Content: {qrValue}
                    </p>
                </div>
            )}
        </Card>
    );
} 