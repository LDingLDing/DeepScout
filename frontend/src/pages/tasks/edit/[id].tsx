import { useState, useEffect } from 'react';
import { Typography, Button, Space, message, Grid, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import MainLayout from '@/components/Layout/MainLayout';
import TaskForm from '@/components/Tasks/TaskForm';
import { useQuery, useMutation } from 'react-query';
import { getTaskById, updateTask } from '@/api/tasks';
import { TaskUpdateInput } from '@/types/task';

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function EditTaskPage() {
  const router = useRouter();
  const { id } = router.query;
  const screens = useBreakpoint();
  
  // 获取任务详情
  const { data: task, isLoading: isLoadingTask, error: fetchError } = useQuery(
    ['task', id],
    () => getTaskById(id as string),
    {
      enabled: !!id,
    }
  );
  
  // 更新任务
  const { mutate, isLoading: isUpdating, error: updateError } = useMutation(
    (taskData: TaskUpdateInput) => updateTask(id as string, taskData),
    {
      onSuccess: () => {
        message.success('任务更新成功');
        router.push(`/tasks/${id}`);
      },
      onError: () => {
        message.error('任务更新失败，请重试');
      }
    }
  );
  
  // 处理表单提交
  const handleSubmit = (values: TaskUpdateInput) => {
    mutate(values);
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.back()}
            />
            <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>
              编辑任务 {task?.name ? `- ${task.name}` : ''}
            </Title>
          </Space>
        </div>

        {fetchError && (
          <Alert
            message="加载失败"
            description="无法加载任务详情，请检查网络连接或稍后重试。"
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {updateError && (
          <Alert
            message="更新失败"
            description="更新任务时发生错误，请检查表单内容并重试。"
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {isLoadingTask ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载任务详情...</div>
          </div>
        ) : task ? (
          <TaskForm
            initialValues={task}
            onSubmit={handleSubmit}
            loading={isUpdating}
            isEdit={true}
          />
        ) : !fetchError && (
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
