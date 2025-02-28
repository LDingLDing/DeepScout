import { useState } from 'react';
import { Typography, Button, message, Grid, Alert, Tabs, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';
import SettingsForm from '@/components/Settings/SettingsForm';
import SystemStatus from '@/components/Settings/SystemStatus';
import { useQuery, useMutation } from 'react-query';
import { getSystemSettings, updateSystemSettings, getSystemStatus } from '@/api/settings';
import { SystemSettings } from '@/types/settings';

const { Title } = Typography;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

export default function SettingsPage() {
  const screens = useBreakpoint();
  
  // 获取系统设置
  const { 
    data: settings, 
    isLoading: isLoadingSettings, 
    error: settingsError,
    refetch: refetchSettings
  } = useQuery('systemSettings', getSystemSettings);
  
  // 获取系统状态
  const {
    data: systemStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus
  } = useQuery('systemStatus', getSystemStatus, {
    refetchInterval: 60000, // 每分钟刷新一次
  });
  
  // 更新系统设置
  const { mutate, isLoading: isUpdating } = useMutation(
    (settingsData: Partial<SystemSettings>) => updateSystemSettings(settingsData),
    {
      onSuccess: () => {
        message.success('设置更新成功');
        refetchSettings();
      },
      onError: () => {
        message.error('设置更新失败，请重试');
      }
    }
  );
  
  // 处理表单提交
  const handleSubmit = (values: Partial<SystemSettings>) => {
    mutate(values);
  };
  
  // 刷新系统状态
  const handleRefreshStatus = () => {
    refetchStatus();
    message.info('正在刷新系统状态...');
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Title level={screens.md ? 3 : 4} style={{ margin: 0 }}>系统设置</Title>
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefreshStatus}
            loading={isLoadingStatus}
          >
            刷新状态
          </Button>
        </div>

        {(settingsError || statusError) && (
          <Alert
            message="加载失败"
            description="无法加载系统信息，请检查网络连接或稍后重试。"
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {isLoadingSettings && isLoadingStatus ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载系统信息...</div>
          </div>
        ) : (
          <Tabs defaultActiveKey="1" type={screens.md ? "card" : "line"}>
            <TabPane tab="系统状态" key="1">
              {systemStatus && (
                <SystemStatus 
                  status={systemStatus} 
                  loading={isLoadingStatus} 
                />
              )}
            </TabPane>
            <TabPane tab="系统设置" key="2">
              {settings && (
                <SettingsForm
                  initialValues={settings}
                  onSubmit={handleSubmit}
                  loading={isUpdating}
                />
              )}
            </TabPane>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
