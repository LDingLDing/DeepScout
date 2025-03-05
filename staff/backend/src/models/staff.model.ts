// 定义管理员角色枚举
export enum StaffRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  READONLY = 'readonly',
}

// 定义管理员状态枚举
export enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// 定义管理员模型接口
export interface StaffModel {
  staffid: number;
  username: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  password?: string;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}
