import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
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
import { StaffRole } from '../../api/staff';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { staff, isAuthenticated, isLoading, logout } = useAuth();

  // 
  const isActive = (path: string) => {
    return router.pathname.includes(path);
  };

  // 
  const userMenu = (
    <Menu>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  // 
  if (isLoading || !isAuthenticated) {
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
            <Link href="/dashboard">仪表盘</Link>
          </Menu.Item>
          
          <Menu.Item key="sources" icon={<ApiOutlined />}>
            <Link href="/sources">信息源管理</Link>
          </Menu.Item>
          
          <Menu.Item key="tasks" icon={<CodeOutlined />}>
            <Link href="/tasks">任务管理</Link>
          </Menu.Item>
          
          <Menu.Item key="logs" icon={<FileTextOutlined />}>
            <Link href="/logs">日志管理</Link>
          </Menu.Item>
          
          {staff?.role === StaffRole.ADMIN && (
            <Menu.Item key="accounts" icon={<UserOutlined />}>
              <Link href="/accounts">账号管理</Link>
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
              <span>{staff?.username}</span>
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
