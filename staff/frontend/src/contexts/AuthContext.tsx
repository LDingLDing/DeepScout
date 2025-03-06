import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Staff } from '../api/staff';
import { message } from 'antd';

interface AuthContextType {
  staff: Staff | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, staffData: Staff) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  staff: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化时检查是否已登录
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const storedStaff = localStorage.getItem('staff');

      if (token && storedStaff) {
        try {
          const staffData = JSON.parse(storedStaff);
          setStaff(staffData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse staff data:', error);
          // 清除无效的数据
          localStorage.removeItem('token');
          localStorage.removeItem('staff');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 登录
  const login = (token: string, staffData: Staff) => {
    localStorage.setItem('token', token);
    localStorage.setItem('staff', JSON.stringify(staffData));
    setStaff(staffData);
    setIsAuthenticated(true);
  };

  // 注销
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('staff');
    setStaff(null);
    setIsAuthenticated(false);
    message.success('已成功退出');
    router.push('/staff/login');
  };

  return (
    <AuthContext.Provider
      value={{
        staff,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
