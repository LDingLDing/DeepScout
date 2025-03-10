import { useState } from 'react';
import { Form, Input, Button, Toast } from 'antd-mobile';
import { useRouter } from 'next/router';
import styles from './login.module.scss';

const LoginPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGetCode = async () => {
    try {
      await form.validateFields(['email']);
      const email = form.getFieldValue('email');
      // TODO: 调用发送验证码接口
      Toast.show({
        icon: 'success',
        content: '验证码已发送',
      });
      startCountdown();
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '请输入正确的邮箱地址',
      });
    }
  };

  const onFinish = async (values: any) => {
    try {
      // TODO: 调用登录接口
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      router.push('/square');
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '登录失败，请重试',
      });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>InfoRadar</h1>
      <div className={styles.formWrapper}>
        <Form
          form={form}
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" size="large">
              登录
            </Button>
          }
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
            extra={
              <Button
                size="small"
                onClick={handleGetCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
              </Button>
            }
          >
            <Input placeholder="请输入验证码" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
