import { useState } from 'react';
import { Typography, Button, Space, Spin, Alert, Grid, Skeleton, Tabs } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import MainLayout from '@/components/Layout/MainLayout';
import TaskDetail from '@/components/Tasks/TaskDetail';
import { useQuery } from 'react-query';
import { getTaskById } from '@/api/tasks';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const screens = useBreakpoint();
  
  // 获取任务详情
  const { data: task, isLoading, error, refetch } = useQuery(
    ['task', id],
    () => getTaskById(id as string),
    {
      enabled: !!id,
      refetchInterval: 30000, // 每30秒刷新一次
    }
  );

  return (
    <MainLayout>
      <div style={{ maxWidth: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: screens.md ? 'row' : 'column',
          gap: screens.md ? 0 : 16,
          marginBottom: 24
        }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/tasks')}
            />
            {isLoading ? (
              <Skeleton.Input active style={{ width: 200 }} />
            ) : (
              <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>{task?.name || '任务详情'}</Title>
            )}
          </Space>
          
          {!isLoading && task && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/tasks/edit/${id}`)}
            >
              编辑任务
            </Button>
          )}
        </div>

        {error ? (
          <Alert
            message="加载失败"
            description="无法加载任务详情，请检查网络连接或稍后重试。"
            type="error"
            showIcon
          />
        ) : isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载任务详情...</div>
          </div>
        ) : task ? (
          <div>
            {screens.md ? (
              <TaskDetail task={task} onRefresh={refetch} />
            ) : (
              <Tabs defaultActiveKey="1">
                <TabPane tab="基本信息" key="1">
                  <TaskDetail task={task} onRefresh={refetch} tabView="basic" />
                </TabPane>
                <TabPane tab="监控目标" key="2">
                  <TaskDetail task={task} onRefresh={refetch} tabView="targets" />
                </TabPane>
                <TabPane tab="执行结果" key="3">
                  <TaskDetail task={task} onRefresh={refetch} tabView="results" />
                </TabPane>
              </Tabs>
            )}
          </div>
        ) : (
          <Alert
            message="任务不存在"
            description="找不到指定的任务，可能已被删除。"
            type="warning"
            showIcon
          />
        )}
      </div>
    </MainLayout>
  );
}
