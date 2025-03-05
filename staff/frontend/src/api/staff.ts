import axios from 'axios';
import { API_BASE_URL } from './index';

// Staff接口类型
export interface Staff {
  staffid: number;
  username: string;
  name: string;
  role: 'super_admin' | 'admin' | 'readonly';
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  staff: Omit<Staff, 'password'>;
}

// 登录请求
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/staff/login`, { username, password });
  return response.data;
};

// 获取当前用户信息
export const getCurrentStaff = async (): Promise<Staff> => {
  const response = await axios.get(`${API_BASE_URL}/staff/profile`);
  return response.data;
};

// 获取所有管理员
export const getAllStaff = async (): Promise<Staff[]> => {
  const response = await axios.get(`${API_BASE_URL}/staff`);
  return response.data;
};

// 获取特定管理员
export const getStaffById = async (id: number): Promise<Staff> => {
  const response = await axios.get(`${API_BASE_URL}/staff/${id}`);
  return response.data;
};

// 创建管理员
export const createStaff = async (staffData: {
  username: string;
  password: string;
  name: string;
  role: 'super_admin' | 'admin' | 'readonly';
}): Promise<Staff> => {
  const response = await axios.post(`${API_BASE_URL}/staff`, staffData);
  return response.data;
};

// 更新管理员
export const updateStaff = async (
  id: number,
  staffData: Partial<{
    name: string;
    role: 'super_admin' | 'admin' | 'readonly';
    status: 'active' | 'inactive';
    password: string;
  }>
): Promise<Staff> => {
  const response = await axios.patch(`${API_BASE_URL}/staff/${id}`, staffData);
  return response.data;
};

// 重置密码
export const resetPassword = async (id: number, password: string): Promise<{ message: string }> => {
  const response = await axios.post(`${API_BASE_URL}/staff/${id}/reset-password`, { password });
  return response.data;
};
