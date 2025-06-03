import React from 'react';
import { Carousel, Typography, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

const carouselItems = [
  {
    id: '1',
    title: 'INNOVATION DAY 2025',
    subtitle: 'Ngày hội công nghệ lớn nhất năm',
    description: 'Khám phá những xu hướng công nghệ mới nhất cùng các chuyên gia hàng đầu ngành CNTT.',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    link: '/events/1',
  },
  {
    id: '2',
    title: 'CAREER EXPO 2025',
    subtitle: 'Kết nối sinh viên với doanh nghiệp',
    description: 'Cơ hội việc làm, thực tập và giao lưu với hơn 50 doanh nghiệp lớn trong và ngoài nước.',
    image: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/events/2',
},
{
    id: '3',
    title: 'HACKATHON FPTU 2025',
    subtitle: 'Cuộc thi lập trình trong 48 giờ',
    description: 'Thử thách kỹ năng, sáng tạo không giới hạn và cơ hội giành giải thưởng lên đến 50 triệu đồng.',
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: '/events/3',
},
];

const EventCarousel: React.FC = () => {
  return (
    <div style={{ width: '100%' }}>
      <Carousel autoplay>
        {carouselItems.map((item) => (
          <div key={item.id}>
            <div style={{
              height: '600px',
              position: 'relative',
              backgroundImage: `url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
              }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                  <div style={{ maxWidth: '600px' }}>
                    <Text style={{ color: '#ff8533', marginBottom: '8px', display: 'block' }}>
                      {item.subtitle}
                    </Text>
                    <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
                      {item.title}
                    </Title>
                    <Text style={{ color: '#e5e5e5', fontSize: '18px', marginBottom: '24px', display: 'block' }}>
                      {item.description}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default EventCarousel;