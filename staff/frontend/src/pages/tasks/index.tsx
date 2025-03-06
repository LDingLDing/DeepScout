import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { getTasks, deleteTask, executeTask } from '../../api/tasks';
import { getSources } from '../../api/sources';
import { Task, TaskStatus } from '../../types/task';
import { Source } from '../../types/source';
import { useAuth } from '../../contexts/AuthContext'
import StaffLayout from '../../components/staff/StaffLayout';

const { Option } = Select;

const TaskList: React.FC = () => {
  const router = useRouter();
  const { staff } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
    keyword: '',
    sourceId: null as number | null,
    status: '',
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks(searchParams);
      setTasks(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error('获取任务列表失败', error);
      message.error('获取任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await getSources({ pageSize: 100 });
      setSources(res.data.data);
    } catch (error) {
      console.error('获取信息源列表失败', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSources();
  }, [searchParams]);

  const handleSearch = () => {
    setSearchParams({ ...searchParams, page: 1 });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTask(id);
          message.success('删除成功');
          fetchTasks();
        } catch (error) {
          console.error('删除任务失败', error);
          message.error('删除任务失败');
        }
      },
    });
  };

  const handleExecute = async (id: number) => {
    try {
      await executeTask(id);
      message.success('任务已提交执行');
      fetchTasks();
    } catch (error) {
      console.error('执行任务失败', error);
      message.error('执行任务失败');
    }
  };

  const columns = [
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
      title: '信息源',
      dataIndex: 'sourceName',
      key: 'sourceName',
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
      title: '下次执行',
      dataIndex: 'nextRunAt',
      key: 'nextRunAt',
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
        <Space size="middle">
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleExecute(record.id);
            }}
            disabled={staff?.role === 'viewer' || record.status !== TaskStatus.ACTIVE}
          >
            执行
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tasks/edit/${record.id}`);
            }}
            disabled={staff?.role === 'viewer'}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
            disabled={staff?.role !== 'admin'}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <StaffLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space wrap>
            <Input
              placeholder="搜索任务名称或描述"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              style={{ width: 200 }}
              onPressEnter={handleSearch}
              suffix={<SearchOutlined onClick={handleSearch} />}
            />
            <Select
              placeholder="信息源"
              style={{ width: 150 }}
              allowClear
              value={searchParams.sourceId}
              onChange={(value) => setSearchParams({ ...searchParams, sourceId: value ? Number(value) : null, page: 1 })}
            >
              {sources.map((source) => (
                <Option key={source.id} value={source.id}>
                  {source.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              allowClear
              value={searchParams.status || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, status: value, page: 1 })}
            >
              <Option value={TaskStatus.ACTIVE}>活动</Option>
              <Option value={TaskStatus.INACTIVE}>停用</Option>
              <Option value={TaskStatus.ERROR}>错误</Option>
            </Select>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
              搜索
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/tasks/create')}
            disabled={staff?.role === 'viewer'}
          >
            新建任务
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.pageSize,
            total: total,
            onChange: (page, pageSize) => {
              setSearchParams({
                ...searchParams,
                page,
                pageSize: pageSize || 10,
              });
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/tasks/detail/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
    </StaffLayout>
  );
};

export default TaskList;
