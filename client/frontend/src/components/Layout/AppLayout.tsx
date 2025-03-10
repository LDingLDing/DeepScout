import React, { useEffect, useState } from 'react';
import { TabBar } from 'antd-mobile';
import { useRouter } from 'next/router';
import { AppOutline, UserOutline, UnorderedListOutline } from 'antd-mobile-icons';
import { useTranslation } from 'react-i18next';
import styles from './AppLayout.module.scss';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { pathname } = router;
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    {
      key: '/explore',
      title: t('nav.explore'),
      icon: (active: boolean) => <AppOutline color={active ? 'var(--primary-color)' : 'var(--secondary-color)'} />,
    },
    {
      key: '/subscriptions',
      title: t('nav.subscriptions'),
      icon: (active: boolean) => <UnorderedListOutline color={active ? 'var(--primary-color)' : 'var(--secondary-color)'} />,
    },
    {
      key: '/profile',
      title: t('nav.profile'),
      icon: (active: boolean) => <UserOutline color={active ? 'var(--primary-color)' : 'var(--secondary-color)'} />,
    },
  ];

  const setRouteActive = (value: string) => {
    router.push(value);
  };

  // 如果是登录页面，不显示底部导航
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>{children}</main>
      {mounted && (
        <TabBar
          className={styles.tabBar}
          activeKey={pathname}
          onChange={value => setRouteActive(value)}
        >
          {tabs.map(item => (
            <TabBar.Item
              key={item.key}
              icon={item.icon}
              title={item.title}
            />
          ))}
        </TabBar>
      )}
    </div>
  );
};

export default AppLayout;
