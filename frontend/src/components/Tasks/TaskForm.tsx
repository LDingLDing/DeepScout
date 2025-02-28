import { useState } from 'react';
import { Form, Input, Button, Select, TimePicker, Space, Divider, Card, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Task, TaskCreateInput, TaskSchedule } from '@/types/task';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (values: TaskCreateInput) => void;
  loading: boolean;
}

export default function TaskForm({ initialValues, onSubmit, loading }: TaskFormProps) {
  const [form] = Form.useForm();
  const [frequency, setFrequency] = useState<string>(initialValues?.schedule?.frequency || 'once');

  const handleSubmit = (values: any) => {
    // 处理表单数据
    const formattedValues: TaskCreateInput = {
      name: values.name,
      description: values.description,
      extract_rules: values.extract_rules,
      targets: values.targets,
      schedule: {
        frequency: values.frequency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // 使用浏览器时区
      },
    };
    
    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        extract_rules: initialValues?.extract_rules || '',
        targets: initialValues?.targets || [{ url: '' }],
        frequency: initialValues?.schedule?.frequency || 'once',
      }}
    >
      <Card title="基本信息" style={{ marginBottom: 24 }}>
        <Form.Item
          name="name"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>

        <Form.Item name="description" label="任务描述">
          <TextArea
            placeholder="请输入任务描述"
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>
      </Card>

      <Card title="监控目标" style={{ marginBottom: 24 }}>
        <Form.List name="targets">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: 'flex', marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'url']}
                    rules={[{ required: true, message: '请输入URL' }]}
                  >
                    <Input placeholder="请输入监控URL" style={{ width: 400 }} />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'selector']}>
                    <Input placeholder="CSS选择器（可选）" style={{ width: 200 }} />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  )}
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加监控URL
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Card>

      <Card title="数据提取规则" style={{ marginBottom: 24 }}>
        <Form.Item
          name="extract_rules"
          rules={[{ required: true, message: '请输入数据提取规则' }]}
        >
          <TextArea
            placeholder="请输入数据提取规则，例如：提取所有文章标题、发布日期和内容摘要"
            autoSize={{ minRows: 4, maxRows: 10 }}
          />
        </Form.Item>
      </Card>

      <Card title="调度设置">
        <Form.Item
          name="frequency"
          label="执行频率"
          rules={[{ required: true, message: '请选择执行频率' }]}
        >
          <Select onChange={(value) => setFrequency(value as string)}>
            <Option value="once">一次性执行</Option>
            <Option value="hourly">每小时</Option>
            <Option value="daily">每天</Option>
            <Option value="weekly">每周</Option>
            <Option value="monthly">每月</Option>
          </Select>
        </Form.Item>
      </Card>

      <Divider />

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? '更新任务' : '创建任务'}
        </Button>
      </Form.Item>
    </Form>
  );
}
