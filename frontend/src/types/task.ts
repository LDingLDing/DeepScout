export interface TaskTarget {
  url: string;
  selector?: string;
}

export interface TaskSchedule {
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  extract_rules: string;
  targets: TaskTarget[];
  schedule: TaskSchedule;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface TaskCreateInput {
  name: string;
  description?: string;
  extract_rules: string;
  targets: TaskTarget[];
  schedule: TaskSchedule;
}

export interface TaskUpdateInput {
  name?: string;
  description?: string;
  extract_rules?: string;
  targets?: TaskTarget[];
  schedule?: TaskSchedule;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
}

export interface TaskResult {
  id: string;
  taskId: string;
  url: string;
  timestamp: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  paused: number;
  todayResults: number;
}
