import React from 'react';
import { Row, Col, Card, Typography, Statistic } from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  BankOutlined, 
  TrophyOutlined 
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const statisticsItems = [
  {
    icon: <CalendarOutlined style={{ fontSize: 36, color: '#ff8533' }} />,
    count: '200+',
    label: 'Sự kiện đã tổ chức',
    description: 'Mỗi năm, chúng tôi tổ chức hơn 200 sự kiện đa dạng.',
  },
    {
        icon: <TeamOutlined style={{ fontSize: 36, color: '#ff8533' }} />,
        count: '15.000+',
        label: 'Lượt tham gia',
        description: 'Hơn 15.000 lượt sinh viên và giảng viên tham gia.',
    },
    {
        icon: <BankOutlined style={{ fontSize: 36, color: '#ff8533' }} />,
        count: '30+',
        label: 'Đơn vị tổ chức',
        description: 'Các khoa, phòng ban và CLB sinh viên tham gia tổ chức sự kiện.',
    },
    {
        icon: <TrophyOutlined style={{ fontSize: 36, color: '#ff8533' }} />,
        count: '95%',
        label: 'Đánh giá tích cực',
        description: '95% người tham gia đánh giá hài lòng với chất lượng sự kiện.',
    },
];

const StatisticsSection: React.FC = () => {
  return (
    <div style={{ 
      background: '#27272a',
      width: '100%',
      margin: '0', // Add this
      padding: '64px 50px', // Match the container padding
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        width: '100%' // Add this
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={2} style={{ color: 'white' }}>
            FPT Events trong con số
          </Title>
          <Paragraph style={{ color: '#a3a3a3', maxWidth: 600, margin: '0 auto' }}>
            Chúng tôi tự hào về những con số thể hiện sự phát triển và tầm ảnh hưởng 
            của hệ thống quản lý sự kiện tại FPT University.
          </Paragraph>
        </div>
        
        <div style={{ width: '100%' }}>
          <Row gutter={[32, 32]} justify="center">
            {statisticsItems.map((item, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  bordered={false}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: 16 }}>{item.icon}</div>
                  <Statistic
                    value={item.count}
                    valueStyle={{ color: '#ff8533' }}
                    title={<span style={{ color: 'white' }}>{item.label}</span>}
                  />
                  <Paragraph style={{ color: '#a3a3a3', marginTop: 8 }}>
                    {item.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;