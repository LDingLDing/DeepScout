import { Card, Descriptions, Tag, Button, Tabs, Table, Typography, Space, Tooltip, Alert } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, EditOutlined, DeleteOutlined, CodeOutlined } from '@ant-design/icons';
import { Task, TaskResult } from '@/types/task';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { runTask, pauseTask, resumeTask, deleteTask } from '@/api/tasks';
import ReactJson from 'react-json-view';

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

interface TaskDetailProps {
  task: Task;
  results: TaskResult[];
  loading: boolean;
  onRefresh: () => void;
}

export default function TaskDetail({ task, results, loading, onRefresh }: TaskDetailProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'green';
      case 'pending':
        return 'blue';
      case 'completed':
        return 'cyan';
      case 'failed':
        return 'red';
      case 'paused':
        return 'orange';
      default:
        return 'default';
    }
  };

  // 获取状态中文名称
  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'pending':
        return '等待中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'paused':
        return '已暂停';
      default:
        return status;
    }
  };

  // 获取频率中文名称
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'once':
        return '一次性';
      case 'hourly':
        return '每小时';
      case 'daily':
        return '每天';
      case 'weekly':
        return '每周';
      case 'monthly':
        return '每月';
      default:
        return frequency;
    }
  };

  // 运行任务
  const handleRunTask = async () => {
    try {
      setActionLoading(true);
      await runTask(task.id);
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // 暂停任务
  const handlePauseTask = async () => {
    try {
      setActionLoading(true);
      await pauseTask(task.id);
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // 恢复任务
  const handleResumeTask = async () => {
    try {
      setActionLoading(true);
      await resumeTask(task.id);
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // 删除任务
  const handleDeleteTask = async () => {
    try {
      setActionLoading(true);
      await deleteTask(task.id);
      router.push('/tasks');
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // 结果表格列
  const resultColumns = [
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (url: string) => (
        <Tooltip title={url}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'success',
      key: 'success',
      render: (success: boolean) => (
        <Tag color={success ? 'green' : 'red'}>
          {success ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => (
        <span>{new Date(timestamp).toLocaleString()}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TaskResult) => (
        <Button
          icon={<CodeOutlined />}
          onClick={() => {
            // 显示详细数据的模态框
          }}
          type="link"
        >
          查看数据
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>{task.name}</Title>
            <Space>
              {task.status === 'running' ? (
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={handlePauseTask}
                  loading={actionLoading}
                >
                  暂停
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={task.status === 'paused' ? handleResumeTask : handleRunTask}
                  loading={actionLoading}
                >
                  {task.status === 'paused' ? '恢复' : '运行'}
                </Button>
              )}
              <Button
                icon={<EditOutlined />}
                onClick={() => router.push(`/tasks/edit/${task.id}`)}
              >
                编辑
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteTask}
                loading={actionLoading}
              >
                删除
              </Button>
            </Space>
          </div>

          {task.description && (
            <Paragraph>{task.description}</Paragraph>
          )}

          <Descriptions bordered column={2}>
            <Descriptions.Item label="任务ID">{task.id}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(task.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="最后更新">
              {new Date(task.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="执行频率">
              {getFrequencyText(task.schedule.frequency)}
            </Descriptions.Item>
            <Descriptions.Item label="时区">
              {task.schedule.timezone}
            </Descriptions.Item>
            <Descriptions.Item label="上次执行">
              {task.lastRunAt ? new Date(task.lastRunAt).toLocaleString() : '未执行'}
            </Descriptions.Item>
            <Descriptions.Item label="下次执行">
              {task.nextRunAt ? new Date(task.nextRunAt).toLocaleString() : '未调度'}
            </Descriptions.Item>
          </Descriptions>

          <Tabs defaultActiveKey="1">
            <TabPane tab="监控目标" key="1">
              <Table
                dataSource={task.targets.map((target, index) => ({
                  key: index,
                  url: target.url,
                  selector: target.selector || '无',
                }))}
                columns={[
                  {
                    title: 'URL',
                    dataIndex: 'url',
                    key: 'url',
                    ellipsis: true,
                    render: (url: string) => (
                      <Tooltip title={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url}
                        </a>
                      </Tooltip>
                    ),
                  },
                  {
                    title: '选择器',
                    dataIndex: 'selector',
                    key: 'selector',
                  },
                ]}
                pagination={false}
              />
            </TabPane>
            <TabPane tab="提取规则" key="2">
              <Card>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {task.extract_rules}
                </pre>
              </Card>
            </TabPane>
            <TabPane tab="执行结果" key="3">
              {results.length > 0 ? (
                <Table
                  dataSource={results.map(result => ({ ...result, key: result.id }))}
                  columns={resultColumns}
                  expandable={{
                    expandedRowRender: record => (
                      <Card>
                        {record.data ? (
                          <ReactJson src={record.data} name={false} collapsed={2} />
                        ) : record.error ? (
                          <Alert message={record.error} type="error" />
                        ) : (
                          <Alert message="无数据" type="info" />
                        )}
                      </Card>
                    ),
                  }}
                />
              ) : (
                <Alert
                  message="暂无执行结果"
                  description="任务尚未执行或未返回任何结果"
                  type="info"
                />
              )}
            </TabPane>
          </Tabs>
        </Space>
      </Card>
    </div>
  );
}
