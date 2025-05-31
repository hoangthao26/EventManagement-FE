"use client";

import React from 'react';
import { Layout, Typography, Space, Row, Col } from 'antd';
import {
    CalendarOutlined,
    FacebookOutlined, 
    InstagramOutlined, 
    YoutubeOutlined,
    MailOutlined, 
    PhoneOutlined, 
    EnvironmentOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Footer } = Layout;
const { Text } = Typography;

export const PageFooter: React.FC = () => {
    const router = useRouter();

    return (
        <Footer style={{ 
            background: '#27272a',
            padding: '48px 50px 24px'
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Row gutter={[32, 32]} justify="space-between">
                    <Col xs={24} md={8}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                            <div style={{ background: '#ff8533', borderRadius: '8px', padding: '6px' }}>
                                <CalendarOutlined style={{ color: 'white', fontSize: '20px' }} />
                            </div>
                            <Text strong style={{ color: '#fff', fontSize: '20px' }}>
                                FPT<Text strong style={{ color: '#ff8533' }}>Events</Text>
                            </Text>
                        </div>
                        <Text style={{ color: '#e5e5e5', display: 'block', marginBottom: 24 }}>
                            Hệ thống quản lý sự kiện FPT University - nơi kết nối sinh viên, giảng viên 
                            với các sự kiện hội thảo, workshop và talkshow hấp dẫn.
                        </Text>
                        <Space size="large">
                            <FacebookOutlined 
                                style={{ color: '#fff', fontSize: 24, cursor: 'pointer' }} 
                                onClick={() => window.open('https://www.facebook.com/FPTU.HCM')}
                            />
                            <InstagramOutlined 
                                style={{ color: '#fff', fontSize: 24, cursor: 'pointer' }}
                                onClick={() => window.open('https://www.instagram.com/fptu.hcm')}
                            />
                            <YoutubeOutlined 
                                style={{ color: '#fff', fontSize: 24, cursor: 'pointer' }}
                                onClick={() => window.open('https://www.youtube.com/@DaihocFPTHCMOfficial')}
                            />
                        </Space>
                    </Col>

                    <Col xs={24} md={8}>
                        <Text strong style={{ color: '#fff', fontSize: 18, display: 'block', marginBottom: 16 }}>
                            Liên hệ
                        </Text>
                        <Space direction="vertical" size="middle">
                            <Space>
                                <EnvironmentOutlined style={{ color: '#ff8533' }} />
                                <Text style={{ color: '#e5e5e5' }}>
                                    Lô E2a-7, Đường D1, Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức
                                </Text>
                            </Space>
                            <Space>
                                <PhoneOutlined style={{ color: '#ff8533' }} />
                                <Text style={{ color: '#e5e5e5' }}>
                                    <a href="tel:(028) 7300 5588" style={{ color: '#e5e5e5' }}>
                                        (028) 7300 5588
                                    </a>
                                </Text>
                            </Space>
                            <Space>
                                <MailOutlined style={{ color: '#ff8533' }} />
                                <Text style={{ color: '#e5e5e5' }}>
                                    <a href="mailto:daihoc.hcm@fpt.edu.vn" style={{ color: '#e5e5e5' }}>
                                        daihoc.hcm@fpt.edu.vn
                                    </a>
                                </Text>
                            </Space>
                        </Space>
                    </Col>
                </Row>

                <div style={{ 
                    marginTop: 48, 
                    paddingTop: 24, 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center'
                }}>
                    <Text style={{ color: '#a3a3a3' }}>
                        © {new Date().getFullYear()} FPT Events. All rights reserved.
                    </Text>
                </div>
            </div>
        </Footer>
    );
};

export default PageFooter;