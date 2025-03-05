import React, { useState, useEffect } from 'react';
import { Table, Card, Form, Input, Button, DatePicker, Select, Tag, Space, Modal } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import StaffLayout from '../../components/staff/StaffLayout';
import { getLogs, getLogDetail, LogStatus, TaskLog } from '../../api/task-logs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const LogsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<any>({});
  const [form] = Form.useForm();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<TaskLog | null>(null);

  // 状态标签颜色映射
  const statusColors: Record<LogStatus, string> = {
    success: 'success',
    failed: 'error',
    running: 'processing'
  };

  // 获取日志列表
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getLogs({
        page,
        pageSize,
        ...filters
      });
      
      setLogs(response.logs);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载时获取日志
  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, filters]);

  // 处理表单提交
  const handleSearch = (values: any) => {
    const { taskid, status, dateRange } = values;
    
    const newFilters: any = {};
    
    if (taskid) {
      newFilters.taskid = taskid;
    }
    
    if (status) {
      newFilters.status = status;
    }
    
    if (dateRange && dateRange.length === 2) {
      newFilters.startDate = dateRange[0].format('YYYY-MM-DD');
      newFilters.endDate = dateRange[1].format('YYYY-MM-DD');
    }
    
    setFilters(newFilters);
    setPage(1); // 重置到第一页
  };

  // 查看日志详情
  const viewLogDetail = async (logId: number) => {
    try {
      setLoading(true);
      const log = await getLogDetail(logId);
      setCurrentLog(log);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch log details:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列
  const columns = [
    {
      title: 'ID',
      dataIndex: 'logid',
      key: 'logid',
      width: 80,
    },
    {
      title: '任务ID',
      dataIndex: 'taskid',
      key: 'taskid',
    },
    {
      title: '任务名称',
      dataIndex: ['task', 'source', 'name'],
      key: 'taskName',
      render: (text: string, record: TaskLog) => (
        <span>{text || `Task ${record.taskid}`}</span>
      ),
    },
    {
      title: '执行时间',
      dataIndex: 'execution_time',
      key: 'executionTime',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: LogStatus) => {
        const statusText = {
          success: '成功',
          failed: '失败',
          running: '运行中'
        }[status];
        
        return <Tag color={statusColors[status]}>{statusText}</Tag>;
      },
    },
    {
      title: '耗时',
      dataIndex: 'duration_ms',
      key: 'duration',
      render: (ms: number) => ms ? `${(ms / 1000).toFixed(2)}s` : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TaskLog) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => viewLogDetail(record.logid)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <StaffLayout>
      <div style={{ padding: '0 0 24px' }}>
        <h2>日志列表</h2>
        
        <Card style={{ marginBottom: 16 }}>
          <Form 
            form={form} 
            layout="inline" 
            onFinish={handleSearch}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
          >
            <Form.Item name="taskid" label="任务ID">
              <Input placeholder="输入任务ID" style={{ width: 150 }} />
            </Form.Item>
            
            <Form.Item name="status" label="状态">
              <Select placeholder="选择状态" style={{ width: 150 }} allowClear>
                <Option value="success">成功</Option>
                <Option value="failed">失败</Option>
                <Option value="running">运行中</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="dateRange" label="时间范围">
              <RangePicker style={{ width: 300 }} />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
            </Form.Item>
          </Form>
        </Card>
        
        <Table 
          columns={columns} 
          dataSource={logs} 
          rowKey="logid"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize || 10);
            },
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </div>

      {/* 日志详情模态框 */}
      <Modal
        title="日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentLog && (
          <div>
            <p><strong>日志ID:</strong> {currentLog.logid}</p>
            <p><strong>任务ID:</strong> {currentLog.taskid}</p>
            <p><strong>执行时间:</strong> {new Date(currentLog.execution_time).toLocaleString('zh-CN')}</p>
            <p>
              <strong>状态:</strong> 
              <Tag color={statusColors[currentLog.status]} style={{ marginLeft: 8 }}>
                {currentLog.status === 'success' ? '成功' : 
                 currentLog.status === 'failed' ? '失败' : '运行中'}
              </Tag>
            </p>
            <p><strong>耗时:</strong> {currentLog.duration_ms ? `${(currentLog.duration_ms / 1000).toFixed(2)}s` : '-'}</p>
            
            {currentLog.output && (
              <div>
                <p><strong>输出:</strong></p>
                <pre style={{ 
                  maxHeight: '300px', 
                  overflow: 'auto', 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px',
                  borderRadius: '4px'
                }}>
                  {currentLog.output}
                </pre>
              </div>
            )}
            
            {currentLog.error && (
              <div>
                <p><strong>错误:</strong></p>
                <pre style={{ 
                  maxHeight: '300px', 
                  overflow: 'auto', 
                  backgroundColor: '#fff2f0', 
                  padding: '12px',
                  borderRadius: '4px',
                  color: '#f5222d'
                }}>
                  {currentLog.error}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </StaffLayout>
  );
};

export default LogsPage;
