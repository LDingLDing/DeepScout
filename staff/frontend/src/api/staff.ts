import axiosInstance from '../utils/axios-config';

// Staff角色枚举
export enum StaffRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

// Staff接口类型
export interface Staff {
  id: number;
  username: string;
  email?: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 登录响应类型
export interface LoginResponse {
  access_token: string;
  staff: Omit<Staff, 'password'>;
}

// 登录请求
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post(`/staff/login`, { username, password });
  return response.data;
};

// 获取当前用户信息
export const getCurrentStaff = async (): Promise<Staff> => {
  const response = await axiosInstance.get(`/staff/profile`);
  return response.data;
};

// 获取所有管理员
export const getAllStaff = async (): Promise<Staff[]> => {
  const response = await axiosInstance.get(`/staff`);
  return response.data;
};

// 获取特定管理员
export const getStaffById = async (id: number): Promise<Staff> => {
  const response = await axiosInstance.get(`/staff/${id}`);
  return response.data;
};

// 创建管理员
export const createStaff = async (staffData: {
  username: string;
  password: string;
  email?: string;
  role: StaffRole;
}): Promise<Staff> => {
  const response = await axiosInstance.post(`/staff`, staffData);
  return response.data;
};

// 更新管理员
export const updateStaff = async (
  id: number,
  staffData: Partial<{
    email?: string;
    role?: StaffRole;
    isActive?: boolean;
    password?: string;
  }>
): Promise<Staff> => {
  const response = await axiosInstance.patch(`/staff/${id}`, staffData);
  return response.data;
};

// 重置密码
export const resetPassword = async (id: number, password: string): Promise<{ message: string }> => {
  if (!id || typeof id !== 'number') {
    throw new Error('Invalid staff ID');
  }
  
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password');
  }
  
  const response = await axiosInstance.post(`/staff/${id}/reset-password`, { password });
  return response.data;
};
