export enum TaskStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

export interface Task {
  id: string;
  name: string;
  sourceId: string;
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
    id: string;
    username: string;
  };
}

export interface TaskVersion {
  id: string;
  taskId: string;
  version: number;
  code: string;
  config?: Record<string, any>;
  comment?: string;
  createdBy: number;
  createdAt: string;
  creator?: {
    id: string;
    username: string;
  };
}
