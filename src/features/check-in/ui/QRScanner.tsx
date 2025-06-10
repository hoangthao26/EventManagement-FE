'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, message, Modal } from 'antd';
import { CameraOutlined, CloseOutlined, ExclamationCircleOutlined, ScanOutlined } from '@ant-design/icons';
import { checkInParticipant } from '../model/api';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';


interface QRScannerProps {
    eventId: number;
    onSuccess?: () => void;
}

export function QRScanner({ eventId, onSuccess }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isScanning) {
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                        showTorchButtonIfSupported: true,
                        showZoomSliderIfSupported: true,
                        defaultZoomValueIfSupported: 2,
                        rememberLastUsedCamera: true,
                        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                    },
                    false
                );
                scanner.render(handleScan, handleError);
                scannerRef.current = scanner;
            }
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        }
        // Cleanup khi unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        };
    }, [isScanning]);

    const handleScan = async (decodedText: string) => {
        try {
            setLoading(true);
            // QR code chứa: email,eventId
            const [email, qrEventId] = decodedText.split(',');
            if (!email || !qrEventId) {
                setErrorMessage('QR code invalid format');
                setErrorModalVisible(true);
                setIsScanning(false);
                return;
            }
            if (Number(qrEventId) !== eventId) {
                setErrorMessage('Wrong event');
                setErrorModalVisible(true);
                setIsScanning(false);
                return;
            }
            try {
                await checkInParticipant(eventId, email);
                message.success('Check-in successful');
                onSuccess?.();
                setIsScanning(false);
            } catch (error: any) {
                const apiMessage = error?.message || '';
                const apiStatus = error?.status;
                if (
                    (typeof apiMessage === 'string' && apiMessage.includes('User not found')) ||
                    apiStatus === 404
                ) {
                    setErrorMessage('Email not found in this event');
                    setErrorModalVisible(true);
                    setIsScanning(false);
                } else if (
                    typeof apiMessage === 'string' && apiMessage.includes('already been checked in')
                ) {
                    setErrorMessage('This registration has already been checked in.');
                    setErrorModalVisible(true);
                    setIsScanning(false);
                } else {
                    setErrorMessage('Error during check-in');
                    setErrorModalVisible(true);
                    setIsScanning(false);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error: string) => {
        // Chỉ xử lý các lỗi không phải NotFoundException
        if (typeof error === 'string' && error.includes('NotFoundException')) {
            // Bỏ qua, không log, không message
            return;
        }
        console.error('QR Scan error:', error);
        message.error('Error scanning QR code. Please try again.');
    };

    return (
        <div>
            {!isScanning ? (
                <Button
                    type="primary"
                    icon={<ScanOutlined />}
                    onClick={() => setIsScanning(true)}
                >
                    Scan QR Code
                </Button>
            ) : (
                <Modal
                    title="Scan QR Code"
                    open={isScanning}
                    onCancel={() => setIsScanning(false)}
                    footer={null}
                    width={400}
                    bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    afterClose={() => {
                        if (scannerRef.current) {
                            scannerRef.current.clear();
                            scannerRef.current = null;
                        }
                    }}
                >
                    <Card loading={loading} bodyStyle={{ padding: 0, boxShadow: 'none', border: 'none' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 340,
                                width: '100%',
                                paddingTop: 16,
                                paddingBottom: 0,
                                background: 'transparent',
                            }}
                        >
                            <div id="qr-reader" style={{ width: 300, height: 300 }} />
                        </div>
                    </Card>
                </Modal>
            )}

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                        <span>Error</span>
                    </div>
                }
                open={errorModalVisible}
                onOk={() => setErrorModalVisible(false)}
                onCancel={() => setErrorModalVisible(false)}
                footer={[
                    <Button
                        key="ok"
                        type="primary"
                        onClick={() => setErrorModalVisible(false)}
                    >
                        OK
                    </Button>
                ]}
            >
                <p>{errorMessage}</p>
            </Modal>
        </div>
    );
} 