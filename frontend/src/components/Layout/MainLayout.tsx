import { useState, ReactNode, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Grid } from 'antd';
import { 
  DashboardOutlined, 
  BugOutlined, 
  SettingOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();
  const screens = useBreakpoint();
  
  // 响应式处理：在小屏幕上默认折叠侧边栏
  useEffect(() => {
    setCollapsed(!screens.md);
  }, [screens.md]);
  
  // 确定当前选中的菜单项
  const getSelectedKey = () => {
    const path = router.pathname;
    if (path === '/') return '1';
    if (path.startsWith('/tasks')) return '2';
    if (path.startsWith('/settings')) return '3';
    return '1';
  };

  // 菜单项配置
  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: <Link href="/">仪表盘</Link>,
    },
    {
      key: '2',
      icon: <BugOutlined />,
      label: <Link href="/tasks">监控任务</Link>,
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: <Link href="/settings">系统设置</Link>,
    },
  ];

  // 处理菜单点击，在移动端关闭抽屉
  const handleMenuClick = () => {
    if (!screens.md) {
      setDrawerVisible(false);
    }
  };

  // 移动端菜单抽屉
  const renderMobileMenu = () => (
    <Drawer
      title="DeepScout"
      placement="left"
      onClose={() => setDrawerVisible(false)}
      open={drawerVisible}
      bodyStyle={{ padding: 0 }}
    >
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Drawer>
  );

  // PC端侧边栏
  const renderSidebar = () => (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={screens.md ? 80 : 0}
      style={{ display: screens.md ? 'block' : 'none' }}
    >
      <div 
        style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        {!collapsed && 'DeepScout'}
      </div>
      <Menu
        theme="dark"
        selectedKeys={[getSelectedKey()]}
        mode="inline"
        items={menuItems}
      />
    </Sider>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {renderSidebar()}
      
      <Layout className="site-layout">
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}>
          {!screens.md && (
            <Button 
              type="text" 
              icon={<MenuOutlined />} 
              onClick={() => setDrawerVisible(true)}
              style={{ marginRight: 16 }}
            />
          )}
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {!screens.md && 'DeepScout'}
          </div>
        </Header>
        
        <Content style={{ 
          margin: screens.md ? '16px 16px' : '8px 8px', 
          overflow: 'initial',
          transition: 'margin 0.2s'
        }}>
          <div style={{ 
            padding: screens.md ? 24 : 16, 
            minHeight: 360, 
            background: '#fff', 
            borderRadius: 4 
          }}>
            {children}
          </div>
        </Content>
      </Layout>
      
      {renderMobileMenu()}
    </Layout>
  );
}
