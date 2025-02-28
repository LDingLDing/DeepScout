import { Result, Button, Typography, Space } from 'antd';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px 0',
      width: '100%'
    }}>
      <Result
        status="error"
        title="加载失败"
        subTitle={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              <Text type="danger">{errorMessage}</Text>
            </Paragraph>
            {onRetry && (
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={onRetry}
              >
                重试
              </Button>
            )}
          </Space>
        }
      />
    </div>
  );
}
