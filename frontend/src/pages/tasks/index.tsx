import { useState } from 'react';
import { Typography, Button, Space, Empty, Grid, Spin, Alert, Input } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import MainLayout from '@/components/Layout/MainLayout';
import TaskList from '@/components/Tasks/TaskList';
import { useQuery } from 'react-query';
import { getAllTasks } from '@/api/tasks';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { Search } = Input;

export default function TasksPage() {
  const router = useRouter();
  const screens = useBreakpoint();
  const [searchText, setSearchText] = useState('');
  
  // 获取所有任务
  const { data: tasks, isLoading, error, refetch } = useQuery('tasks', getAllTasks);
  
  // 过滤任务
  const filteredTasks = tasks?.filter(task => 
    task.name.toLowerCase().includes(searchText.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

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
          <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>监控任务</Title>
          
          <Space wrap={!screens.md} style={{ width: screens.md ? 'auto' : '100%' }}>
            <Search
              placeholder="搜索任务"
              onSearch={value => setSearchText(value)}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: screens.md ? 200 : '100%' }}
              allowClear
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
              loading={isLoading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/tasks/create')}
            >
              新建任务
            </Button>
          </Space>
        </div>

        {error ? (
          <Alert
            message="加载失败"
            description="无法加载任务列表，请检查网络连接或稍后重试。"
            type="error"
            showIcon
          />
        ) : isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载任务列表...</div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <TaskList 
            tasks={filteredTasks} 
            loading={isLoading} 
            onRefresh={refetch}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText ? "没有找到匹配的任务" : "暂无监控任务，立即创建一个吧！"
            }
          >
            {!searchText && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => router.push('/tasks/create')}
              >
                创建任务
              </Button>
            )}
          </Empty>
        )}
      </div>
    </MainLayout>
  );
}
