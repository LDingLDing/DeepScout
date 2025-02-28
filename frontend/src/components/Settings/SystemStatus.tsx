import { Card, Progress, Descriptions, Badge, Statistic, Row, Col, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { SystemStatus } from '@/types/settings';

const { Title } = Typography;

interface SystemStatusProps {
  status: SystemStatus;
  loading: boolean;
}

export default function SystemStatusComponent({ status, loading }: SystemStatusProps) {
  // 格式化运行时间
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  // 获取爬虫状态徽章
  const getCrawlerStatusBadge = () => {
    switch (status.crawlerStatus) {
      case 'running':
        return <Badge status="success" text="运行中" />;
      case 'stopped':
        return <Badge status="default" text="已停止" />;
      case 'error':
        return <Badge status="error" text="错误" />;
      default:
        return <Badge status="processing" text="未知" />;
    }
  };

  return (
    <div>
      <Title level={4}>系统状态</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="CPU使用率"
              value={status.cpuUsage}
              precision={1}
              suffix="%"
              valueStyle={{ color: status.cpuUsage > 80 ? '#cf1322' : '#3f8600' }}
              prefix={status.cpuUsage > 80 ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
              loading={loading}
            />
            <Progress 
              percent={status.cpuUsage} 
              status={status.cpuUsage > 80 ? "exception" : "normal"} 
              showInfo={false}
              strokeColor={status.cpuUsage > 80 ? "#cf1322" : undefined}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="内存使用率"
              value={status.memoryUsage}
              precision={1}
              suffix="%"
              valueStyle={{ color: status.memoryUsage > 80 ? '#cf1322' : '#3f8600' }}
              prefix={status.memoryUsage > 80 ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
              loading={loading}
            />
            <Progress 
              percent={status.memoryUsage} 
              status={status.memoryUsage > 80 ? "exception" : "normal"} 
              showInfo={false}
              strokeColor={status.memoryUsage > 80 ? "#cf1322" : undefined}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="磁盘使用率"
              value={status.diskUsage}
              precision={1}
              suffix="%"
              valueStyle={{ color: status.diskUsage > 80 ? '#cf1322' : '#3f8600' }}
              prefix={status.diskUsage > 80 ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
              loading={loading}
            />
            <Progress 
              percent={status.diskUsage} 
              status={status.diskUsage > 80 ? "exception" : "normal"} 
              showInfo={false}
              strokeColor={status.diskUsage > 80 ? "#cf1322" : undefined}
            />
          </Card>
        </Col>
      </Row>

      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="爬虫状态">
            {getCrawlerStatusBadge()}
          </Descriptions.Item>
          <Descriptions.Item label="系统运行时间">
            {formatUptime(status.uptime)}
          </Descriptions.Item>
          <Descriptions.Item label="活跃任务数">
            <Badge status="processing" text={`${status.activeTasks} 个任务正在执行`} />
          </Descriptions.Item>
          <Descriptions.Item label="队列中任务">
            <Badge 
              status={status.queuedTasks > 0 ? "warning" : "success"} 
              text={`${status.queuedTasks} 个任务等待执行`} 
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
