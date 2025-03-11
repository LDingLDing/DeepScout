import { useState } from 'react';
import { Form, Input, Button, Toast } from 'antd-mobile';
import { useRouter } from 'next/router';
import styles from './login.module.scss';
import { authApi } from '../services/api';

const LoginPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

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
      setSendingCode(true);
      
      // 调用发送验证码接口
      const success = await authApi.sendVerificationCode(email);
      
      if (success) {
        Toast.show({
          icon: 'success',
          content: '验证码已发送',
        });
        startCountdown();
      } else {
        Toast.show({
          icon: 'fail',
          content: '验证码发送失败，请稍后重试',
        });
      }
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '请输入正确的邮箱地址或检查网络连接',
      });
    } finally {
      setSendingCode(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // 调用登录接口
      const response = await authApi.login(values.email, values.code);
      
      // 保存token到本地存储
      localStorage.setItem('access_token', response.access_token);
      
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      
      // 跳转到探索页面
      router.push('/explore');
    } catch (error) {
      console.error('登录失败:', error);
      Toast.show({
        icon: 'fail',
        content: '验证码无效或已过期，请重试',
      });
    } finally {
      setLoading(false);
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
            <Button block type="submit" color="primary" size="large" loading={loading}>
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
                disabled={countdown > 0 || sendingCode}
                loading={sendingCode}
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
