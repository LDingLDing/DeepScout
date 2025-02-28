import api from './index';
import { SystemSettings } from '@/types/settings';

// 获取系统设置
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await api.get('/settings');
  return response.data;
};

// 更新系统设置
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.put('/settings', settings);
  return response.data;
};

// 获取API使用情况
export const getApiUsage = async (): Promise<any> => {
  const response = await api.get('/settings/api-usage');
  return response.data;
};

// 重置API密钥
export const resetApiKey = async (): Promise<{ apiKey: string }> => {
  const response = await api.post('/settings/reset-api-key');
  return response.data;
};

// 测试代理设置
export const testProxy = async (proxyUrl: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/settings/test-proxy', { proxyUrl });
  return response.data;
};

// 获取系统状态
export const getSystemStatus = async (): Promise<any> => {
  const response = await api.get('/settings/system-status');
  return response.data;
};
