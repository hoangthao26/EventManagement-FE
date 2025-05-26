import React from 'react';
import { Row, Col, Typography, Button, Card, Space } from 'antd';
import { CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

const CTASection: React.FC = () => {
  return (
    <div style={{ 
      background: 'linear-gradient(to right, #ff8533, #ff6b00)',
      width: '100%',
      margin: '0', // Add this
      padding: '64px 50px', // Match the container padding
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        width: '100%' // Add this
      }}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={2} style={{ color: 'white', marginBottom: 24 }}>
              Tham gia cùng chúng tôi và trải nghiệm những sự kiện tuyệt vời!
            </Title>

            <Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
              {['Nhận thông báo về các sự kiện mới nhất',
                'Đăng ký tham gia sự kiện dễ dàng, nhanh chóng',
                'Lưu lại lịch sử tham gia'].map((text, index) => (
                <Space key={index}>
                  <CheckCircleOutlined style={{ color: 'white' }} />
                  <Text style={{ color: 'white' }}>{text}</Text>
                </Space>
              ))}
            </Space>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                position: 'relative',
                zIndex: 1,
                background: 'white',
              }}
            >
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: 24
              }}>
                <CalendarOutlined style={{ fontSize: 24, color: '#ff8533', marginRight: 8 }} />
                <Title level={3} style={{ margin: 0 }}>Sự kiện sắp tới</Title>
              </div>
              
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {[
                  {
                    date: '25/09/2025',
                    title: 'Workshop: Digital Marketing Trends',
                    location: 'Phòng Workshop, ĐH FPT'
                  },
                  // ... other events
                ].map((event, index) => (
                  <Card key={index} size="small">
                    <Text type="secondary" style={{ fontSize: 12 }}>{event.date}</Text>
                    <Paragraph strong style={{ margin: '4px 0' }}>{event.title}</Paragraph>
                    <Text type="secondary">{event.location}</Text>
                  </Card>
                ))}
              </Space>
              
              <Link href="/events" style={{ display: 'block', marginTop: 24 }}>
                <Button type="primary" block>
                  Xem tất cả
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CTASection;