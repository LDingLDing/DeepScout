import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Select, Button, Card, message, Space } from 'antd';
import { RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { createSource } from '../../../api/sources';
import { SourceType, SourceStatus } from '../../../types/source';

const { Option } = Select;
const { TextArea } = Input;

const SourceCreate: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

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

      const res = await createSource(data);
      message.success('创建信息源成功');
      router.push(`/sources/detail/${res.data.id}`);
    } catch (error) {
      console.error('创建信息源失败', error);
      message.error('创建信息源失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title="创建新信息源"
      extra={
        <Button
          icon={<RollbackOutlined />}
          onClick={() => router.push('/sources')}
        >
          返回列表
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: SourceStatus.ACTIVE,
          type: SourceType.WEBSITE,
        }}
      >
        <Form.Item
          name="name"
          label="信息源名称"
          rules={[{ required: true, message: '请输入信息源名称' }]}
        >
          <Input placeholder="请输入信息源名称" />
        </Form.Item>

        <Form.Item
          name="type"
          label="信息源类型"
          rules={[{ required: true, message: '请选择信息源类型' }]}
        >
          <Select placeholder="请选择信息源类型">
            <Option value={SourceType.WEBSITE}>网站</Option>
            <Option value={SourceType.RSS}>RSS</Option>
            <Option value={SourceType.API}>API</Option>
            <Option value={SourceType.WECHAT}>微信</Option>
            <Option value={SourceType.OTHER}>其他</Option>
          </Select>
        </Form.Item>

        <Form.Item name="url" label="URL">
          <Input placeholder="请输入信息源URL" />
        </Form.Item>

        <Form.Item name="description" label="信息源描述">
          <TextArea rows={4} placeholder="请输入信息源描述" />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Select>
            <Option value={SourceStatus.ACTIVE}>启用</Option>
            <Option value={SourceStatus.INACTIVE}>禁用</Option>
          </Select>
        </Form.Item>

        <Form.Item name="config" label="配置信息 (JSON格式)">
          <TextArea rows={5} placeholder="请输入JSON格式的配置信息" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
              保存
            </Button>
            <Button onClick={() => router.push('/sources')}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SourceCreate;
