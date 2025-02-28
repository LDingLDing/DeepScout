import { useState } from 'react';
import { Table, Tag, Button, Space, Modal, message, Grid, Card, List, Badge, Typography } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { Task } from '@/types/task';
import { useMutation, useQueryClient } from 'react-query';
import { deleteTask, runTask, pauseTask } from '@/api/tasks';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
}

export default function TaskList({ tasks, loading, onRefresh }: TaskListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // 删除任务
  const { mutate: deleteMutate, isLoading: isDeleting } = useMutation(
    (id: string) => deleteTask(id),
    {
      onSuccess: () => {
        message.success('任务删除成功');
        setDeleteModalVisible(false);
        onRefresh();
      },
      onError: () => {
        message.error('任务删除失败，请重试');
      }
    }
  );
  
  // 运行任务
  const { mutate: runMutate, isLoading: isRunning } = useMutation(
    (id: string) => runTask(id),
    {
      onSuccess: () => {
        message.success('任务已开始运行');
        onRefresh();
      },
      onError: () => {
        message.error('启动任务失败，请重试');
      }
    }
  );
  
  // 暂停任务
  const { mutate: pauseMutate, isLoading: isPausing } = useMutation(
    (id: string) => pauseTask(id),
    {
      onSuccess: () => {
        message.success('任务已暂停');
        onRefresh();
      },
      onError: () => {
        message.error('暂停任务失败，请重试');
      }
    }
  );
  
  // 确认删除
  const confirmDelete = (task: Task) => {
    setSelectedTask(task);
    setDeleteModalVisible(true);
  };
  
  // 执行删除
  const handleDelete = () => {
    if (selectedTask) {
      deleteMutate(selectedTask.id);
    }
  };
  
  // 获取任务状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'running':
        return <Tag color="success">运行中</Tag>;
      case 'paused':
        return <Tag color="warning">已暂停</Tag>;
      case 'completed':
        return <Tag color="blue">已完成</Tag>;
      case 'failed':
        return <Tag color="error">失败</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Task) => (
        <a onClick={() => router.push(`/tasks/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '执行频率',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: any) => schedule?.frequency || '手动执行',
    },
    {
      title: '上次执行',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '从未执行',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Task) => (
        <Space size="small">
          {record.status === 'running' ? (
            <Button 
              icon={<PauseCircleOutlined />} 
              size="small"
              onClick={() => pauseMutate(record.id)}
              loading={isPausing && selectedTask?.id === record.id}
            >
              暂停
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              size="small"
              onClick={() => runMutate(record.id)}
              loading={isRunning && selectedTask?.id === record.id}
              disabled={record.status === 'completed'}
            >
              运行
            </Button>
          )}
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => router.push(`/tasks/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => confirmDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  
  // 移动端列表渲染
  const renderMobileList = () => (
    <List
      dataSource={tasks}
      renderItem={(task) => (
        <List.Item
          key={task.id}
          actions={[
            task.status === 'running' ? (
              <Button 
                icon={<PauseCircleOutlined />} 
                size="small"
                onClick={() => pauseMutate(task.id)}
                loading={isPausing && selectedTask?.id === task.id}
              />
            ) : (
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                size="small"
                onClick={() => runMutate(task.id)}
                loading={isRunning && selectedTask?.id === task.id}
                disabled={task.status === 'completed'}
              />
            ),
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => router.push(`/tasks/${task.id}`)}
            />,
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => router.push(`/tasks/edit/${task.id}`)}
            />,
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => confirmDelete(task)}
            />
          ]}
        >
          <List.Item.Meta
            title={
              <Space>
                <a onClick={() => router.push(`/tasks/${task.id}`)}>{task.name}</a>
                {getStatusTag(task.status)}
              </Space>
            }
            description={
              <Space direction="vertical" size={0}>
                <Text type="secondary">频率: {task.schedule?.frequency || '手动执行'}</Text>
                {task.lastRunAt && (
                  <Text type="secondary">上次执行: {new Date(task.lastRunAt).toLocaleString()}</Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <>
      {screens.md ? (
        <Table 
          columns={columns} 
          dataSource={tasks} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Card bodyStyle={{ padding: 0 }}>
          {renderMobileList()}
        </Card>
      )}
      
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="删除"
        cancelText="取消"
        confirmLoading={isDeleting}
      >
        <p>确定要删除任务 "{selectedTask?.name}" 吗？此操作不可恢复。</p>
      </Modal>
    </>
  );
}
