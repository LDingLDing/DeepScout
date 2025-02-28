import { useState } from 'react';
import { Form, Input, InputNumber, Switch, Button, Card, Tabs, Space, Divider, Typography, Alert } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { SystemSettings } from '@/types/settings';

const { TabPane } = Tabs;
const { Text } = Typography;

interface SettingsFormProps {
  initialValues: SystemSettings;
  onSubmit: (values: Partial<SystemSettings>) => void;
  loading: boolean;
}

export default function SettingsForm({ initialValues, onSubmit, loading }: SettingsFormProps) {
  const [form] = Form.useForm();
  const [proxyEnabled, setProxyEnabled] = useState(initialValues.proxy.enabled);

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="爬虫设置" key="1">
          <Card title="爬虫性能配置" style={{ marginBottom: 24 }}>
            <Form.Item
              name={['crawler', 'poolSize']}
              label="浏览器实例池大小"
              rules={[{ required: true, message: '请输入浏览器实例池大小' }]}
              tooltip="同时维护的浏览器实例数量，增加可提高并发，但会消耗更多内存"
            >
              <InputNumber min={1} max={20} />
            </Form.Item>

            <Form.Item
              name={['crawler', 'requestInterval']}
              label="请求间隔(毫秒)"
              rules={[{ required: true, message: '请输入请求间隔' }]}
              tooltip="两次请求之间的最小间隔时间，避免请求过于频繁"
            >
              <InputNumber min={500} step={100} />
            </Form.Item>

            <Form.Item
              name={['crawler', 'timeout']}
              label="请求超时(毫秒)"
              rules={[{ required: true, message: '请输入请求超时时间' }]}
            >
              <InputNumber min={5000} step={1000} />
            </Form.Item>

            <Form.Item
              name="maxConcurrentTasks"
              label="最大并发任务数"
              rules={[{ required: true, message: '请输入最大并发任务数' }]}
              tooltip="同时执行的最大任务数量"
            >
              <InputNumber min={1} max={10} />
            </Form.Item>
          </Card>

          <Card title="爬虫行为配置">
            <Form.Item
              name={['crawler', 'userAgentRotation']}
              label="启用用户代理轮换"
              valuePropName="checked"
              tooltip="每次请求使用不同的浏览器标识，降低被反爬的风险"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name={['crawler', 'enableScreenshot']}
              label="启用截图功能"
              valuePropName="checked"
              tooltip="爬取过程中保存页面截图，便于调试，但会增加存储空间占用"
            >
              <Switch />
            </Form.Item>
          </Card>
        </TabPane>

        <TabPane tab="代理设置" key="2">
          <Card>
            <Form.Item
              name={['proxy', 'enabled']}
              label="启用代理"
              valuePropName="checked"
            >
              <Switch onChange={setProxyEnabled} />
            </Form.Item>

            {proxyEnabled && (
              <>
                <Form.List name={['proxy', 'urls']}>
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
                            name={name}
                            rules={[{ required: true, message: '请输入代理URL' }]}
                          >
                            <Input placeholder="代理URL (例如: http://proxy.example.com:8080)" style={{ width: 400 }} />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          添加代理
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>

                <Form.Item
                  name={['proxy', 'username']}
                  label="代理用户名(可选)"
                >
                  <Input placeholder="代理认证用户名" />
                </Form.Item>

                <Form.Item
                  name={['proxy', 'password']}
                  label="代理密码(可选)"
                >
                  <Input.Password placeholder="代理认证密码" />
                </Form.Item>
              </>
            )}
          </Card>
        </TabPane>

        <TabPane tab="API设置" key="3">
          <Card>
            <Alert
              message="API密钥安全提示"
              description="API密钥用于访问DeepSeek API进行数据处理，请妥善保管，不要泄露给他人。"
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              name={['api', 'apiKey']}
              label="DeepSeek API密钥"
              rules={[{ required: true, message: '请输入API密钥' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name={['api', 'apiUrl']}
              label="API基础URL"
              rules={[{ required: true, message: '请输入API基础URL' }]}
            >
              <Input placeholder="例如: https://api.deepseek.com" />
            </Form.Item>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Text strong>API使用情况</Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text>已使用: {initialValues.api.apiUsage.used} 次</Text>
              <Text>限额: {initialValues.api.apiUsage.limit} 次</Text>
              <Text>重置日期: {new Date(initialValues.api.apiUsage.resetDate).toLocaleDateString()}</Text>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="通知设置" key="4">
          <Card>
            <Form.Item
              name="enableEmailNotifications"
              label="启用邮件通知"
              valuePropName="checked"
              tooltip="任务完成或失败时发送邮件通知"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notificationEmail"
              label="通知邮箱"
              rules={[
                { 
                  required: Form.useWatch('enableEmailNotifications', form), 
                  message: '请输入通知邮箱' 
                },
                {
                  type: 'email',
                  message: '请输入有效的邮箱地址'
                }
              ]}
            >
              <Input placeholder="接收通知的邮箱地址" />
            </Form.Item>
          </Card>
        </TabPane>
      </Tabs>

      <Divider />

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          保存设置
        </Button>
      </Form.Item>
    </Form>
  );
}
