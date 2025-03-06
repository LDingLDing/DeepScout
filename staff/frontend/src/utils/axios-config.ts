import axios from 'axios';
import { API_BASE_URL } from '../api';
import { message } from 'antd';

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果token存在，则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的token和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('staff');
      
      // 显示错误提示
      message.error('登录已过期，请重新登录');
      
      // 重定向到登录页
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else if (error.response && error.response.data) {
      // 显示后端返回的错误信息
      message.error(error.response.data.message || '请求失败');
    } else {
      // 显示通用错误提示
      message.error('网络错误，请稍后重试');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
