import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Descriptions, Button, Tag, Table, Space, message } from 'antd';
import { EditOutlined, RollbackOutlined } from '@ant-design/icons';
import { getSourceDetail } from '../../../api/sources';
import { getTasks } from '../../../api/tasks';
import { Source, SourceType, SourceStatus } from '../../../types/source';
import { Task, TaskStatus } from '../../../types/task';
import { useAuth } from '../../../contexts/auth'

const SourceDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [source, setSource] = useState<Source | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  const fetchSourceDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await getSourceDetail(Number(id));
      setSource(res.data);
    } catch (error) {
      console.error('获取信息源详情失败', error);
      message.error('获取信息源详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTasks = async () => {
    if (!id) return;
    
    setTasksLoading(true);
    try {
      const res = await getTasks({ sourceId: Number(id), pageSize: 100 });
      setTasks(res.data.data);
    } catch (error) {
      console.error('获取相关任务失败', error);
      message.error('获取相关任务失败');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSourceDetail();
      fetchRelatedTasks();
    }
  }, [id]);

  if (!source) {
    return <div>加载中...</div>;
  }

  const getTypeTag = (type: SourceType) => {
    const typeMap = {
      [SourceType.WEBSITE]: { color: 'blue', text: '网站' },
      [SourceType.RSS]: { color: 'green', text: 'RSS' },
      [SourceType.API]: { color: 'purple', text: 'API' },
      [SourceType.WECHAT]: { color: 'cyan', text: '微信' },
      [SourceType.OTHER]: { color: 'orange', text: '其他' },
    };
    return <Tag color={typeMap[type]?.color}>{typeMap[type]?.text}</Tag>;
  };

  const getStatusTag = (status: SourceStatus) => {
    return (
      <Tag color={status === SourceStatus.ACTIVE ? 'success' : 'default'}>
        {status === SourceStatus.ACTIVE ? '启用' : '禁用'}
      </Tag>
    );
  };

  const taskColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => {
        const statusMap = {
          [TaskStatus.ACTIVE]: { color: 'success', text: '活动' },
          [TaskStatus.INACTIVE]: { color: 'default', text: '停用' },
          [TaskStatus.ERROR]: { color: 'error', text: '错误' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: '上次执行',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      render: (text: string) => (text ? new Date(text).toLocaleString('zh-CN') : '-'),
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
      render: (_, record: Task) => (
        <Button
          type="link"
          onClick={() => router.push(`/tasks/detail/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={`信息源详情: ${source.name}`}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/sources/edit/${source.id}`)}
              disabled={user?.role === 'viewer'}
            >
              编辑信息源
            </Button>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => router.push('/sources')}
            >
              返回列表
            </Button>
          </Space>
        }
        loading={loading}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{source.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{source.name}</Descriptions.Item>
          <Descriptions.Item label="类型">{getTypeTag(source.type)}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(source.status)}</Descriptions.Item>
          <Descriptions.Item label="URL" span={2}>{source.url || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {new Date(source.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {source.description || '-'}
          </Descriptions.Item>
          {source.config && (
            <Descriptions.Item label="配置信息" span={2}>
              <pre style={{ maxHeight: '200px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '16px' }}>
                {JSON.stringify(source.config, null, 2)}
              </pre>
            </Descriptions.Item>
          )}
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <Card title="关联任务" loading={tasksLoading}>
            <Table
              columns={taskColumns}
              dataSource={tasks}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: '暂无关联任务' }}
            />
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default SourceDetail;
