import { Empty, Typography, Space } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface EmptyStateProps {
  description?: string;
  image?: React.ReactNode;
  button?: React.ReactNode;
}

export default function EmptyState({
  description = '暂无数据',
  image,
  button
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0',
      width: '100%'
    }}>
      <Space direction="vertical" align="center" size="middle">
        <Empty
          image={image || <InboxOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
          description={<Text type="secondary">{description}</Text>}
        />
        {button && <div>{button}</div>}
      </Space>
    </div>
  );
}
