import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import axios from 'axios';

// 用户角色类型
export type UserRole = 'admin' | 'editor' | 'viewer';

// 用户信息类型
export interface User {
  id: number;
  username: string;
  role: UserRole;
  email?: string;
  avatar?: string;
}

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者属性类型
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 检查用户是否已登录
  const checkAuth = async (): Promise<boolean> => {
    try {
      // 从本地存储获取令牌
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return false;
      }

      // 设置请求头中的认证令牌
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 获取当前用户信息
      const response = await axios.get('/api/staff/profile');
      setUser(response.data);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('认证检查失败:', err);
      // 清除无效令牌
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // 登录函数
  const login = async (username: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // 发送登录请求
      const response = await axios.post('/api/staff/login', { username, password });
      const { token, user: userData } = response.data;

      // 保存令牌到本地存储
      localStorage.setItem('token', token);
      
      // 设置请求头中的认证令牌
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 设置用户信息
      setUser(userData);
      message.success('登录成功');
    } catch (err: any) {
      console.error('登录失败:', err);
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
      message.error(err.response?.data?.message || '登录失败，请检查用户名和密码');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    // 清除本地存储中的令牌
    localStorage.removeItem('token');
    
    // 清除请求头中的认证令牌
    delete axios.defaults.headers.common['Authorization'];
    
    // 清除用户信息
    setUser(null);
    message.success('已退出登录');
  };

  // 组件挂载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 提供认证上下文
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义hook，用于在组件中访问认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
