'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, message, Modal } from 'antd';
import { CameraOutlined, CloseOutlined, ExclamationCircleOutlined, ScanOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { checkInParticipant, checkInByQRCode } from '../model/api';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import styles from './QRScanner.module.css';
import { useAntdMessage } from '@/shared/lib/hooks/useAntdMessage';

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
    const { showSuccess, showError } = useAntdMessage();
    const isProcessing = useRef(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    useEffect(() => {
        if (isScanning) {
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 20,
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
        if (isProcessing.current) return;
        isProcessing.current = true;
        try {
            setLoading(true);
            try {
                await checkInByQRCode(decodedText);
                setSuccessModalVisible(true);
                onSuccess?.();
                setIsScanning(false);
            } catch (error: any) {
                const status = error?.response?.status;
                if (status === 400) {
                    showError('Invalid QR code or check-in not allowed');
                } else if (status === 403) {
                    showError('You do not have permission to check-in');
                } else if (status === 404) {
                    showError('Event, user or registration not found');
                } else {
                    showError('Error during check-in');
                }
                setIsScanning(false);
            }
        } finally {
            setLoading(false);
            setTimeout(() => { isProcessing.current = false; }, 500);
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
                    size="large"
                    style={{ height: '50px', fontSize: '16px' }}
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
                        isProcessing.current = false;
                    }}
                >
                    <Card loading={loading} bodyStyle={{ padding: 0, boxShadow: 'none', border: 'none' }}>
                        <div className={styles.scannerContainer}>
                            <div id="qr-reader" className={styles.qrReader} />
                            <div className={styles.scanLine} />
                            <div className={styles.cornerBorder}>
                                <div className={styles.cornerTopLeft} />
                                <div className={styles.cornerTopRight} />
                                <div className={styles.cornerBottomLeft} />
                                <div className={styles.cornerBottomRight} />
                            </div>
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

            <Modal
                open={successModalVisible}
                onCancel={() => setSuccessModalVisible(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setSuccessModalVisible(false)}>
                        Confirm
                    </Button>
                ]}
                centered
                maskClosable
                closeIcon
                width={400}
                bodyStyle={{ textAlign: 'center', padding: '40px 24px' }}
            >
                <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 64, marginBottom: 16 }} />
                <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Check-in successful</div>
            </Modal>
        </div>
    );
} 