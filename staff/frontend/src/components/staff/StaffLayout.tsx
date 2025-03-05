import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  ApiOutlined,
  CodeOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Staff } from '../../api/staff';

const { Header, Sider, Content } = Layout;

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [staffInfo, setStaffInfo] = useState<Staff | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // 在客户端加载时获取用户信息
  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/staff/login');
      return;
    }

    // 获取用户信息
    const storedStaffInfo = localStorage.getItem('staff');
    if (storedStaffInfo) {
      try {
        setStaffInfo(JSON.parse(storedStaffInfo));
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to parse staff info:', error);
        handleLogout();
      }
    }
  }, [router]);

  // 注销
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
    message.success('已成功退出');
    router.push('/staff/login');
  };

  // 判断当前菜单项
  const isActive = (path: string) => {
    return router.pathname.includes(path);
  };

  // 用户下拉菜单
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人信息
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出
      </Menu.Item>
    </Menu>
  );

  // 如果未登录，返回空内容
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: collapsed ? '16px' : '20px' }}>
            {collapsed ? 'IR' : 'InfoRadar'}
          </h1>
        </div>
        
        <Menu theme="dark" mode="inline" selectedKeys={[isActive('/dashboard') ? 'dashboard' : isActive('/sources') ? 'sources' : isActive('/tasks') ? 'tasks' : isActive('/logs') ? 'logs' : isActive('/accounts') ? 'accounts' : '']}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link href="/staff/dashboard">仪表盘</Link>
          </Menu.Item>
          
          <Menu.Item key="sources" icon={<ApiOutlined />}>
            <Link href="/staff/sources">数据源管理</Link>
          </Menu.Item>
          
          <Menu.Item key="tasks" icon={<CodeOutlined />}>
            <Link href="/staff/tasks">任务管理</Link>
          </Menu.Item>
          
          <Menu.Item key="logs" icon={<FileTextOutlined />}>
            <Link href="/staff/logs">日志管理</Link>
          </Menu.Item>
          
          {staffInfo?.role === 'super_admin' && (
            <Menu.Item key="accounts" icon={<UserOutlined />}>
              <Link href="/staff/accounts">账号管理</Link>
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <Button 
            type="text" 
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          />
          
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>{staffInfo?.name}</span>
            </div>
          </Dropdown>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;
