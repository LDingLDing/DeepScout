import { Spin, Typography, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingStateProps {
  text?: string;
  size?: 'small' | 'default' | 'large';
  fullPage?: boolean;
}

export default function LoadingState({
  text = '加载中...',
  size = 'default',
  fullPage = false
}: LoadingStateProps) {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'small' ? 16 : size === 'large' ? 40 : 24 }} spin />;
  
  const content = (
    <Space direction="vertical" align="center" size="middle">
      <Spin indicator={antIcon} size={size} />
      {text && <Text type="secondary">{text}</Text>}
    </Space>
  );
  
  if (fullPage) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 200px)',
        width: '100%'
      }}>
        {content}
      </div>
    );
  }
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0',
      width: '100%'
    }}>
      {content}
    </div>
  );
}
