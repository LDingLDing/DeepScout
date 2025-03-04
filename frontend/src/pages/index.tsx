import { useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Button, Grid, Space } from 'antd';
import { PlusOutlined, DashboardOutlined, ApiOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import MainLayout from '@/components/Layout/MainLayout';
import StatisticCard from '@/components/Dashboard/StatisticCard';
import { useQuery } from 'react-query';
import { getTaskStats } from '@/api/tasks';
import { getApiUsage } from '@/api/settings';

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function Home() {
  const router = useRouter();
  const screens = useBreakpoint();
  
  // 获取任务统计数据
  const { data: taskStats, isLoading: taskStatsLoading } = useQuery('taskStats', getTaskStats, {
    refetchInterval: 60000, // 每分钟刷新一次
  });
  
  // 获取API使用情况
  const { data: apiUsage, isLoading: apiUsageLoading } = useQuery('apiUsage', getApiUsage, {
    refetchInterval: 300000, // 每5分钟刷新一次
  });

  return (
    <MainLayout>
      <div style={{ maxWidth: '100%' }}>
        <Title level={screens.md ? 2 : 3}>信息雷达</Title>
        <Paragraph>
          通过AI增强的精准信息采集+结构化处理，帮助从业者用1/5时间完成领域动态监控
        </Paragraph>
        
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <StatisticCard
              title="活跃监控任务"
              value={taskStats?.active || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DashboardOutlined />}
              loading={taskStatsLoading}
              tooltip="当前正在运行的监控任务数量"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatisticCard
              title="今日采集数据"
              value={taskStats?.todayResults || 0}
              suffix="条"
              prefix={<FileTextOutlined />}
              loading={taskStatsLoading}
              tooltip="今日成功采集的数据条数"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatisticCard
              title="API调用余额"
              value={apiUsage?.remaining || 1000}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              suffix="积分"
              prefix={<ApiOutlined />}
              loading={apiUsageLoading}
              tooltip="剩余API调用积分，用于数据处理"
            />
          </Col>
        </Row>
        
        <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size={screens.md ? 'middle' : 'large'}
            block={!screens.md}
            onClick={() => router.push('/tasks/create')}
          >
            创建监控任务
          </Button>
          
          {!screens.md && (
            <Button 
              type="default"
              block
              onClick={() => router.push('/tasks')}
            >
              查看所有任务
            </Button>
          )}
        </Space>
      </div>
    </MainLayout>
  );
}
