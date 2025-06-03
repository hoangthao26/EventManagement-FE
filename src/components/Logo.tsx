import React from 'react';
import { Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LogoProps {
  color?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ color = 'default' }) => {
  const textStyle = color === 'white' ? { color: '#fff' } : {};
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ 
        background: '#ff8533', 
        borderRadius: '8px', 
        padding: '6px' 
      }}>
        <CalendarOutlined style={{ color: 'white', fontSize: '20px' }} />
      </div>
      <Text strong style={{ fontSize: '20px', ...textStyle }}>
        FPT<Text strong style={{ color: '#ff8533' }}>Events</Text>
      </Text>
    </div>
  );
};

export default Logo;