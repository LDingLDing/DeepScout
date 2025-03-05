import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Spin,
  Space
} from 'antd';
import { 
  UserOutlined, 
  ApiOutlined, 
  CodeOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import StaffLayout from '../../components/staff/StaffLayout';
import { getLogsByTaskId } from '../../api/task-logs';
import type { TaskLog, LogStatus } from '../../api/task-logs';

// 状态标签颜色映射
const statusColors: Record<LogStatus, string> = {
  success: 'green',
  failed: 'red',
  running: 'blue'
};

// 状态图标映射
const statusIcons: Record<LogStatus, React.ReactNode> = {
  success: <CheckCircleOutlined />,
  failed: <CloseCircleOutlined />,
  running: <SyncOutlined spin />
};

const DashboardPage: React.FC = () => {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    running: 0
  });

  // 模拟的数据统计
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 这里应该使用真实的API来获取最新的任务日志数据
        // 模拟获取最新的任务日志数据
        setTimeout(() => {
          // 在真实应用中应该使用API来获取最新的任务日志数据
          // 这里使用模拟数据
          const mockLogs: TaskLog[] = [
            {
              logid: 1,
              taskid: 101,
              execution_time: '2025-03-05T05:30:22Z',
              status: 'success',
              duration_ms: 1245,
              created_at: '2025-03-05T05:30:22Z',
              task: {
                taskid: 101,
                sourceid: 1,
                source_type: 'web',
                code: 'crawler_script_1',
                version: 1,
                created_at: '2025-02-01T00:00:00Z',
                source: { name: 'Tech News' }
              }
            },
            {
              logid: 2,
              taskid: 102,
              execution_time: '2025-03-05T05:15:10Z',
              status: 'failed',
              duration_ms: 3450,
              error: 'Connection timeout',
              created_at: '2025-03-05T05:15:10Z',
              task: {
                taskid: 102,
                sourceid: 2,
                source_type: 'rss',
                code: 'rss_parser_1',
                version: 1,
                created_at: '2025-02-05T00:00:00Z',
                source: { name: 'Science Daily' }
              }
            },
            {
              logid: 3,
              taskid: 103,
              execution_time: '2025-03-05T04:45:30Z',
              status: 'running',
              duration_ms: 0,
              created_at: '2025-03-05T04:45:30Z',
              task: {
                taskid: 103,
                sourceid: 3,
                source_type: 'wechat',
                code: 'wechat_crawler_1',
                version: 2,
                created_at: '2025-02-10T00:00:00Z',
                source: { name: 'WeChat Official' }
              }
            },
          ];
          
          setLogs(mockLogs);
          setStats({
            total: mockLogs.length,
            success: mockLogs.filter(log => log.status === 'success').length,
            failed: mockLogs.filter(log => log.status === 'failed').length,
            running: mockLogs.filter(log => log.status === 'running').length
          });
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 日志表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'logid',
      key: 'logid',
      width: 80,
    },
    {
      title: '任务',
      dataIndex: ['task', 'source', 'name'],
      key: 'taskName',
      render: (text: string, record: TaskLog) => (
        <span>{text || `Task ${record.taskid}`}</span>
      ),
    },
    {
      title: '来源类型',
      dataIndex: ['task', 'source_type'],
      key: 'sourceType',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          web: 'Web爬虫',
          rss: 'RSS解析',
          wechat: '微信公众号爬虫'
        };
        return typeMap[type] || type;
      },
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
      render: (status: LogStatus) => (
        <Tag icon={statusIcons[status]} color={statusColors[status]}>
          {status === 'success' ? '成功' : status === 'failed' ? '失败' : '运行中'}
        </Tag>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'duration_ms',
      key: 'duration',
      render: (ms: number) => ms ? `${(ms / 1000).toFixed(2)}s` : '-',
    },
  ];

  return (
    <StaffLayout>
      <div style={{ padding: '0 0 24px' }}>
        <h2>数据统计概览</h2>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="总数" 
                value={stats.total} 
                prefix={<UserOutlined />} 
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="成功任务" 
                value={stats.success} 
                prefix={<CheckCircleOutlined />} 
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="失败任务" 
                value={stats.failed} 
                prefix={<CloseCircleOutlined />} 
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="运行中任务" 
                value={stats.running} 
                prefix={<SyncOutlined spin />} 
              />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <h3>最新执行日志</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table 
              columns={columns} 
              dataSource={logs} 
              rowKey="logid"
              pagination={false}
            />
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default DashboardPage;
