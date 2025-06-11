"use client";

import React from 'react';
import { Card, Typography, Row, Col, Space, Statistic, Timeline } from 'antd';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import { 
  InfoCircleOutlined, 
  TrophyOutlined, 
  TeamOutlined,
  BookOutlined,
  GlobalOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function AboutUsPage() {
  const statistics = [
    { title: 'Sinh viên', value: '20,000+', icon: <TeamOutlined style={{ fontSize: 24, color: '#ff8533' }} /> },
    { title: 'Giảng viên', value: '500+', icon: <BookOutlined style={{ fontSize: 24, color: '#ff8533' }} /> },
    { title: 'Đối tác', value: '100+', icon: <GlobalOutlined style={{ fontSize: 24, color: '#ff8533' }} /> },
    { title: 'Năm kinh nghiệm', value: '15+', icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#ff8533' }} /> }
  ];

  const milestones = [
    {
      year: '2006',
      title: 'Thành lập FPT University',
      description: 'Trường đại học đầu tiên của một doanh nghiệp tại Việt Nam'
    },
    {
      year: '2012',
      title: 'Mở rộng cơ sở',
      description: 'Khai trương cơ sở mới tại Đà Nẵng và Hồ Chí Minh'
    },
    {
      year: '2018',
      title: 'Chứng nhận quốc tế',
      description: 'Đạt chứng nhận kiểm định chất lượng giáo dục quốc tế'
    },
    {
      year: '2023',
      title: 'Phát triển mạnh mẽ',
      description: 'Mở rộng quy mô và chất lượng đào tạo'
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
            <InfoCircleOutlined style={{ fontSize: '32px' }} />
            <Title level={2} style={{ margin: 0, color: 'white' }}>
              Về chúng tôi
            </Title>
          </Space>
        </div>

        {/* Introduction Section */}
        <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={3}>FPT University</Title>
          <Paragraph>
            FPT University được thành lập năm 2006, là trường đại học đầu tiên của một doanh nghiệp 
            tại Việt Nam. Chúng tôi tập trung vào đào tạo công nghệ thông tin, kinh tế số và các 
            ngành học đáp ứng nhu cầu của cuộc Cách mạng công nghiệp 4.0.
          </Paragraph>
        </Card>

        {/* Statistics Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          {statistics.map((stat, index) => (
            <Col xs={12} sm={12} md={6} key={index}>
              <Card>
                <Statistic
                  title={<Text strong>{stat.title}</Text>}
                  value={stat.value}
                  prefix={stat.icon}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Vision & Mission */}
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={12}>
            <Card title={<Title level={4}>Tầm nhìn</Title>}>
              <Paragraph>
                Trở thành trường đại học hàng đầu về đào tạo công nghệ và kinh doanh, 
                góp phần đưa Việt Nam trở thành quốc gia phát triển.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title={<Title level={4}>Sứ mệnh</Title>}>
              <Paragraph>
                Cung cấp giáo dục đại học và nghiên cứu chất lượng cao, đào tạo nguồn 
                nhân lực chất lượng cao, góp phần phát triển cộng đồng.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Milestones */}
        <Card title={<Title level={4}>Chặng đường phát triển</Title>}>
          <Timeline mode="left">
            {milestones.map((milestone, index) => (
              <Timeline.Item 
                key={index}
                label={milestone.year}
                dot={<TrophyOutlined style={{ fontSize: '16px', color: '#ff8533' }} />}
              >
                <Title level={5} style={{ margin: 0 }}>{milestone.title}</Title>
                <Paragraph>{milestone.description}</Paragraph>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </div>
    </HomeLayout>
  );
}
