export enum TaskStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

export interface Task {
  id: number;
  name: string;
  sourceId: number;
  sourceName?: string;
  description?: string;
  currentVersionId?: number;
  currentVersion?: number;
  schedule?: string;
  status: TaskStatus;
  lastRunAt?: string;
  nextRunAt?: string;
  createdBy: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    username: string;
  };
}

export interface TaskVersion {
  id: number;
  taskId: number;
  version: number;
  code: string;
  config?: Record<string, any>;
  comment?: string;
  createdBy: number;
  createdAt: string;
  creator?: {
    id: number;
    username: string;
  };
}
