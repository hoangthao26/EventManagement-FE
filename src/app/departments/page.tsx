"use client";

import React from 'react';
import { Card, Typography, Row, Col, Space, Avatar, Divider } from 'antd';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import { TeamOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function DepartmentsPage() {
  const departments = [
    {
      code: 'SE',
      name: 'Software Engineering',
      description: 'Training software engineers to develop high-quality software products and services.',
      members: 45,
      icon: '🖥️'
    },
    {
      code: 'AI',
      name: 'Artificial Intelligence',
      description: 'Focusing on machine learning, deep learning, and AI applications.',
      members: 30,
      icon: '🤖'
    },
    {
      code: 'IB',
      name: 'International Business',
      description: 'Preparing students for global business environments and international trade.',
      members: 35,
      icon: '🌐'
    },
    {
      code: 'GD',
      name: 'Graphic Design',
      description: 'Developing creative professionals in visual communication and digital media.',
      members: 25,
      icon: '🎨'
    },
    {
      code: 'BA',
      name: 'Business Administration',
      description: 'Training future business leaders and entrepreneurs.',
      members: 40,
      icon: '📊'
    },
    {
      code: 'IS',
      name: 'Information Security',
      description: 'Focusing on cybersecurity and information protection.',
      members: 28,
      icon: '🔒'
    }
  ];

  return (
    <HomeLayout>
      <div style={{ padding: "24px" }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          background: '#ff8533',
          padding: '24px',
          borderRadius: '8px',
          color: 'white'
        }}>
          <Space align="center" size="middle">
            <TeamOutlined style={{ fontSize: '32px' }} />
            <Title level={2} style={{ margin: 0, color: 'white' }}>
              Khoa - Ngành
            </Title>
          </Space>
        </div>

        {/* Intro Section */}
        <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={3}>Chào mừng đến với FPT University</Title>
          <Paragraph>
            Khám phá các khoa và ngành đào tạo đa dạng của chúng tôi, nơi đào tạo những 
            nhà lãnh đạo và chuyên gia tương lai trong nhiều lĩnh vực khác nhau.
          </Paragraph>
        </Card>

        {/* Departments Grid */}
        <Row gutter={[24, 24]}>
          {departments.map((dept) => (
            <Col xs={24} sm={12} md={8} key={dept.code}>
              <Card hoverable>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center', fontSize: '40px' }}>
                    {dept.icon}
                  </div>
                  <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                    {dept.name}
                  </Title>
                  <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                    Mã khoa: {dept.code}
                  </Text>
                  <Divider style={{ margin: '12px 0' }} />
                  <Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
                    {dept.description}
                  </Paragraph>
                  <Space align="center" style={{ width: '100%', justifyContent: 'center' }}>
                    <TeamOutlined style={{ color: '#ff8533' }} />
                    <Text>{dept.members} giảng viên</Text>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </HomeLayout>
  );
}
