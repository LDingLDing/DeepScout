import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../../api/staff';
import { useRouter } from 'next/router';
import styles from '../../styles/Login.module.css';

const StaffLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await login(values.username, values.password);
      
      // 存储令牌和用户信息
      const data = response;
      localStorage.setItem('token', data.token);
      localStorage.setItem('staff', JSON.stringify(data.staff));
      
      message.success('登录成功');
      
      // 跳转到主页
      router.push('/staff/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card title="InfoRadar " className={styles.loginCard}>
        <Form
          name="staff_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default StaffLogin;
