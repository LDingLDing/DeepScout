import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Descriptions, Button, Space, Tabs, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { getTaskVersionDetail } from '../../../../api/tasks';
import { TaskVersion } from '../../../../types/task';

const { TabPane } = Tabs;

const TaskVersionDetail: React.FC = () => {
  const router = useRouter();
  const { taskId, versionId } = router.query;
  const [version, setVersion] = useState<TaskVersion | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVersionDetail = async () => {
    if (!taskId || !versionId) return;
    
    setLoading(true);
    try {
      const res = await getTaskVersionDetail(Number(taskId), Number(versionId));
      setVersion(res.data);
    } catch (error) {
      console.error('获取任务版本详情失败', error);
      message.error('获取任务版本详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId && versionId) {
      fetchVersionDetail();
    }
  }, [taskId, versionId]);

  if (!version) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <Card
        title={`任务版本详情: 版本 ${version.version}`}
        extra={
          <Space>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => router.push(`/tasks/detail/${taskId}`)}
            >
              返回任务详情
            </Button>
          </Space>
        }
        loading={loading}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="版本号">{version.version}</Descriptions.Item>
          <Descriptions.Item label="任务ID">{version.taskId}</Descriptions.Item>
          <Descriptions.Item label="创建人">{version.creator?.username}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(version.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="版本说明" span={2}>
            {version.comment || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Tabs defaultActiveKey="code" style={{ marginTop: 24 }}>
          <TabPane tab="采集代码" key="code">
            <Card>
              <pre style={{ maxHeight: '500px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '16px' }}>
                {version.code}
              </pre>
            </Card>
          </TabPane>
          <TabPane tab="配置信息" key="config">
            <Card>
              <pre style={{ maxHeight: '500px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '16px' }}>
                {version.config ? JSON.stringify(version.config, null, 2) : '无配置信息'}
              </pre>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TaskVersionDetail;
