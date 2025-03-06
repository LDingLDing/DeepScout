import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Descriptions, Button, Tag, Table, Space, Tabs, message, Modal } from 'antd';
import { EditOutlined, PlayCircleOutlined, HistoryOutlined, RollbackOutlined } from '@ant-design/icons';
import { getTaskDetail, getTaskVersions, switchTaskVersion, executeTask } from '../../../api/tasks';
import { Task, TaskStatus, TaskVersion } from '../../../types/task';
import { useAuth } from '../../../contexts/AuthContext'

const { TabPane } = Tabs;

const TaskDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { staff } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [versions, setVersions] = useState<TaskVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);

  const fetchTaskDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await getTaskDetail(Number(id));
      setTask(res.data);
    } catch (error) {
      console.error('获取任务详情失败', error);
      message.error('获取任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskVersions = async () => {
    if (!id) return;
    
    setVersionLoading(true);
    try {
      const res = await getTaskVersions(Number(id));
      setVersions(res.data);
    } catch (error) {
      console.error('获取任务版本列表失败', error);
      message.error('获取任务版本列表失败');
    } finally {
      setVersionLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskDetail();
      fetchTaskVersions();
    }
  }, [id]);

  const handleExecute = async () => {
    if (!task) return;
    
    try {
      await executeTask(task.id);
      message.success('任务已提交执行');
      fetchTaskDetail();
    } catch (error) {
      console.error('执行任务失败', error);
      message.error('执行任务失败');
    }
  };

  const handleSwitchVersion = (versionId: number) => {
    Modal.confirm({
      title: '切换版本',
      content: '确定要切换到此版本吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await switchTaskVersion(Number(id), versionId);
          message.success('版本切换成功');
          fetchTaskDetail();
          fetchTaskVersions();
        } catch (error) {
          console.error('切换版本失败', error);
          message.error('切换版本失败');
        }
      },
    });
  };

  const versionColumns = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      render: (version: number, record: TaskVersion) => (
        <Space>
          {version}
          {task?.currentVersionId === record.id && (
            <Tag color="green">当前</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '说明',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
      title: '创建人',
      dataIndex: ['creator', 'username'],
      key: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TaskVersion) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => router.push(`/tasks/version/${task?.id}/${record.id}`)}
          >
            查看
          </Button>
          {task?.currentVersionId !== record.id && (
            <Button
              type="link"
              onClick={() => handleSwitchVersion(record.id)}
              disabled={staff?.role === 'viewer'}
            >
              切换到此版本
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!task) {
    return <div>加载中...</div>;
  }

  const getStatusTag = (status: TaskStatus) => {
    const statusMap = {
      [TaskStatus.ACTIVE]: { color: 'success', text: '活动' },
      [TaskStatus.INACTIVE]: { color: 'default', text: '停用' },
      [TaskStatus.ERROR]: { color: 'error', text: '错误' },
    };
    return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
  };

  return (
    <div>
      <Card
        title={`任务详情: ${task.name}`}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleExecute}
              disabled={staff?.role === 'viewer' || task.status !== TaskStatus.ACTIVE}
            >
              执行任务
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/tasks/edit/${task.id}`)}
              disabled={staff?.role === 'viewer'}
            >
              编辑任务
            </Button>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => router.push('/tasks')}
            >
              返回列表
            </Button>
          </Space>
        }
        loading={loading}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{task.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{task.name}</Descriptions.Item>
          <Descriptions.Item label="信息源">{task.sourceName}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(task.status)}</Descriptions.Item>
          <Descriptions.Item label="当前版本">{task.currentVersion || '-'}</Descriptions.Item>
          <Descriptions.Item label="调度表达式">{task.schedule || '-'}</Descriptions.Item>
          <Descriptions.Item label="上次执行时间">
            {task.lastRunAt ? new Date(task.lastRunAt).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="下次执行时间">
            {task.nextRunAt ? new Date(task.nextRunAt).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建人">{task.creator?.username}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(task.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {task.description || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Tabs defaultActiveKey="versions" style={{ marginTop: 24 }}>
          <TabPane tab={<span><HistoryOutlined />版本历史</span>} key="versions">
            <Table
              columns={versionColumns}
              dataSource={versions}
              rowKey="id"
              loading={versionLoading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TaskDetail;
