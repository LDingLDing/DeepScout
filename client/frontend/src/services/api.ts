import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 话题相关接口
export const topicsApi = {
  // 获取所有话题
  getTopics: async () => {
    console.log("获取话题列表");
    const response = await api.get('/topics');
    return response.data;
  },
  
  // 订阅/取消订阅话题
  toggleSubscription: async (id: string) => {
    const response = await api.post(`/topics/${id}/subscribe`);
    return response.data;
  },
};

// 订阅内容相关接口
export const subscriptionsApi = {
  // 获取所有订阅内容
  getSubscriptions: async () => {
    const response = await api.get('/subscriptions');
    return response.data;
  },
  
  // 获取分页订阅内容
  getPaginatedSubscriptions: async (page: number = 1, limit: number = 10) => {
    const response = await api.get('/subscriptions', {
      params: { page, limit }
    });
    return response.data;
  },
  
  // 获取特定话题的订阅内容
  getSubscriptionsByTopic: async (topicId: string) => {
    const response = await api.get(`/subscriptions/topic/${topicId}`);
    return response.data;
  },
};

// 用户相关接口
export const userApi = {
  // 获取用户信息
  getUserProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  // 更新用户配置
  updateUserProfile: async (data: {enable_email_push?: boolean}) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
};

// 认证相关接口
export const authApi = {
  // 发送验证码
  sendVerificationCode: async (email: string) => {
    const response = await api.post('/auth/send-code', { email });
    return response.data.success;
  },
  
  // 登录
  login: async (email: string, code: string) => {
    const response = await api.post('/auth/login', { email, code });
    return response.data;
  },
  
  // 登出
  logout: async () => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token');
    if (!token) {
      // 如果没有token，直接返回成功
      return { success: true };
    }
    
    // 设置请求头中的Authorization
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('access_token');
      // 如果不在登录页，则重定向到登录页
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
