import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Select, Button, Card, message, Space, Switch } from 'antd';
import { RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { getSourceDetail, updateSource } from '../../../api/sources';
import { SourceType, SourceStatus } from '../../../types/source';

const { Option } = Select;
const { TextArea } = Input;

const SourceEdit: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSourceDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await getSourceDetail(Number(id));
      const source = res.data;
      form.setFieldsValue({
        name: source.name,
        type: source.type,
        url: source.url,
        description: source.description,
        status: source.status,
        config: source.config ? JSON.stringify(source.config, null, 2) : '',
      });
    } catch (error) {
      console.error('获取来源详情失败', error);
      message.error('获取来源详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSourceDetail();
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

      await updateSource(Number(id), data);
      message.success('更新来源成功');
      router.push(`/sources/detail/${id}`);
    } catch (error) {
      console.error('更新来源失败', error);
      message.error('更新来源失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={`编辑来源: ${id}`}
      extra={
        <Button
          icon={<RollbackOutlined />}
          onClick={() => router.push(`/sources/detail/${id}`)}
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
      >
        <Form.Item
          name="name"
          label="来源名称"
          rules={[{ required: true, message: '请输入来源名称' }]}
        >
          <Input placeholder="请输入来源名称" />
        </Form.Item>

        <Form.Item
          name="type"
          label="来源类型"
          rules={[{ required: true, message: '请选择来源类型' }]}
        >
          <Select placeholder="请选择来源类型">
            <Option value={SourceType.WEBSITE}>网站</Option>
            <Option value={SourceType.RSS}>RSS</Option>
            <Option value={SourceType.API}>API</Option>
            <Option value={SourceType.WECHAT}>微信</Option>
            <Option value={SourceType.OTHER}>其他</Option>
          </Select>
        </Form.Item>

        <Form.Item name="url" label="URL">
          <Input placeholder="请输入来源URL" />
        </Form.Item>

        <Form.Item name="description" label="来源描述">
          <TextArea rows={4} placeholder="请输入来源描述" />
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
            <Button onClick={() => router.push(`/sources/detail/${id}`)}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SourceEdit;
