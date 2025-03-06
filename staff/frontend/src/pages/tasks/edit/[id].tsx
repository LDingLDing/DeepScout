import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Select, Button, Card, message, Space, Switch } from 'antd';
import { RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { getTaskDetail, updateTask } from '../../../api/tasks';
import { getSources } from '../../../api/sources';
import { TaskStatus } from '../../../types/task';
import { Source } from '../../../types/source';

const { Option } = Select;
const { TextArea } = Input;

const TaskEdit: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await getTaskDetail(Number(id));
      const task = res.data;
      form.setFieldsValue({
        name: task.name,
        sourceId: task.sourceId,
        description: task.description,
        schedule: task.schedule,
        status: task.status,
        code: '', // 代码需要单独获取或者在任务详情中包含
        config: task.config ? JSON.stringify(task.config, null, 2) : '',
        comment: '',
      });
    } catch (error) {
      console.error('获取任务详情失败', error);
      message.error('获取任务详情失败');
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
      message.error('获取信息源列表失败');
    }
  };

  useEffect(() => {
    fetchSources();
    if (id) {
      fetchTaskDetail();
    }
  }, [id]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // 处理配置信息
      let config = null;
      if (values.config) {
        try {
          config = JSON.parse(values.config);
        } catch (e) {
          message.error('配置信息格式不正确，请检查JSON格式');
          setSubmitting(false);
          return;
        }
      }

      const data = {
        ...values,
        config,
      };

      await updateTask(Number(id), data);
      message.success('更新任务成功');
      router.push(`/tasks/detail/${id}`);
    } catch (error) {
      console.error('更新任务失败', error);
      message.error('更新任务失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={`编辑任务: ${id}`}
      extra={
        <Button
          icon={<RollbackOutlined />}
          onClick={() => router.push(`/tasks/detail/${id}`)}
        >
          返回详情
        </Button>
      }
      loading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: TaskStatus.INACTIVE,
        }}
      >
        <Form.Item
          name="name"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>

        <Form.Item
          name="sourceId"
          label="信息源"
          rules={[{ required: true, message: '请选择信息源' }]}
        >
          <Select placeholder="请选择信息源">
            {sources.map((source) => (
              <Option key={source.id} value={source.id}>
                {source.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="description" label="任务描述">
          <TextArea rows={4} placeholder="请输入任务描述" />
        </Form.Item>

        <Form.Item name="schedule" label="调度表达式 (Cron)">
          <Input placeholder="例如: 0 0 * * * (每天零点执行)" />
        </Form.Item>

        <Form.Item name="status" label="任务状态">
          <Select>
            <Option value={TaskStatus.ACTIVE}>活动</Option>
            <Option value={TaskStatus.INACTIVE}>停用</Option>
            <Option value={TaskStatus.ERROR}>错误</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="code"
          label="采集代码"
          rules={[{ required: true, message: '请输入采集代码' }]}
        >
          <TextArea rows={10} placeholder="请输入采集代码" />
        </Form.Item>

        <Form.Item name="config" label="配置信息 (JSON格式)">
          <TextArea rows={5} placeholder="请输入JSON格式的配置信息" />
        </Form.Item>

        <Form.Item name="comment" label="版本说明">
          <Input placeholder="请输入此次更新的说明" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
              保存
            </Button>
            <Button onClick={() => router.push(`/tasks/detail/${id}`)}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TaskEdit;
