import { topicsApi, subscriptionsApi, authApi } from '../services/api';

// 导出话题相关接口
export const fetchTopics = async () => {
  return topicsApi.getTopics();
};

// 导出订阅内容相关接口
export const fetchSubscriptions = async () => {
  return subscriptionsApi.getSubscriptions();
};

// 导出认证相关接口
export const login = async (email: string, code: string) => {
  return authApi.login(email, code);
};

export const sendVerificationCode = async (email: string) => {
  return authApi.sendVerificationCode(email);
};
