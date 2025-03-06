import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { getSources, deleteSource } from '../../api/sources';
import { Source, SourceType, SourceStatus } from '../../types/source';
import { useAuth } from '../../contexts/auth';

const { Option } = Select;

const SourceList: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    pageSize: 10,
    keyword: '',
    type: '',
    status: '',
  });

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await getSources(searchParams);
      setSources(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error('获取信息源列表失败', error);
      message.error('获取信息源列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [searchParams]);

  const handleSearch = () => {
    setSearchParams({ ...searchParams, page: 1 });
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个信息源吗？这将同时删除与之关联的所有任务！',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteSource(id);
          message.success('删除成功');
          fetchSources();
        } catch (error) {
          console.error('删除信息源失败', error);
          message.error('删除信息源失败');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: SourceType) => {
        const typeMap = {
          [SourceType.WEBSITE]: { color: 'blue', text: '网站' },
          [SourceType.RSS]: { color: 'green', text: 'RSS' },
          [SourceType.API]: { color: 'purple', text: 'API' },
          [SourceType.WECHAT]: { color: 'cyan', text: '微信' },
          [SourceType.OTHER]: { color: 'orange', text: '其他' },
        };
        return <Tag color={typeMap[type]?.color}>{typeMap[type]?.text}</Tag>;
      },
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: SourceStatus) => {
        return (
          <Tag color={status === SourceStatus.ACTIVE ? 'success' : 'default'}>
            {status === SourceStatus.ACTIVE ? '启用' : '禁用'}
          </Tag>
        );
      },
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
      render: (_, record: Source) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => router.push(`/sources/edit/${record.id}`)}
            disabled={user?.role === 'viewer'}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            disabled={user?.role !== 'admin'}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索名称或描述"
            value={searchParams.keyword}
            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
            style={{ width: 200 }}
            onPressEnter={handleSearch}
            suffix={<SearchOutlined onClick={handleSearch} />}
          />
          <Select
            placeholder="信息源类型"
            style={{ width: 120 }}
            allowClear
            value={searchParams.type || undefined}
            onChange={(value) => setSearchParams({ ...searchParams, type: value, page: 1 })}
          >
            <Option value={SourceType.WEBSITE}>网站</Option>
            <Option value={SourceType.RSS}>RSS</Option>
            <Option value={SourceType.API}>API</Option>
            <Option value={SourceType.WECHAT}>微信</Option>
            <Option value={SourceType.OTHER}>其他</Option>
          </Select>
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            allowClear
            value={searchParams.status || undefined}
            onChange={(value) => setSearchParams({ ...searchParams, status: value, page: 1 })}
          >
            <Option value={SourceStatus.ACTIVE}>启用</Option>
            <Option value={SourceStatus.INACTIVE}>禁用</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/sources/create')}
            disabled={user?.role === 'viewer'}
          >
            新建信息源
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={sources}
        rowKey="id"
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.pageSize,
          total,
          onChange: (page) => setSearchParams({ ...searchParams, page }),
          showSizeChanger: true,
          onShowSizeChange: (_, size) => setSearchParams({ ...searchParams, pageSize: size, page: 1 }),
        }}
        loading={loading}
        onRow={(record) => ({
          onClick: () => router.push(`/sources/detail/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
};

export default SourceList;
