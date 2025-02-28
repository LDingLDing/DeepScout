import { useState } from 'react';
import { Typography, Button, Space, message, Grid, Alert, Steps } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import MainLayout from '@/components/Layout/MainLayout';
import TaskForm from '@/components/Tasks/TaskForm';
import { useMutation } from 'react-query';
import { createTask } from '@/api/tasks';
import { TaskCreateInput } from '@/types/task';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { Step } = Steps;

export default function CreateTaskPage() {
  const router = useRouter();
  const screens = useBreakpoint();
  const [currentStep, setCurrentStep] = useState(0);
  
  // 创建任务
  const { mutate, isLoading, error } = useMutation(
    (taskData: TaskCreateInput) => createTask(taskData),
    {
      onSuccess: () => {
        message.success('任务创建成功');
        router.push('/tasks');
      },
      onError: () => {
        message.error('任务创建失败，请重试');
      }
    }
  );
  
  // 处理表单提交
  const handleSubmit = (values: TaskCreateInput) => {
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
            <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>创建监控任务</Title>
          </Space>
        </div>
        
        {screens.md && (
          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            <Step title="基本信息" />
            <Step title="监控目标" />
            <Step title="提取规则" />
            <Step title="调度设置" />
          </Steps>
        )}

        {error && (
          <Alert
            message="创建失败"
            description="创建任务时发生错误，请检查表单内容并重试。"
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <TaskForm
          onSubmit={handleSubmit}
          loading={isLoading}
        />
      </div>
    </MainLayout>
  );
}
