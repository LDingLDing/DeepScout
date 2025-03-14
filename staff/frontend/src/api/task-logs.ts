import axios from 'axios';
import { API_BASE_URL } from './index';

// 任务日志状态类型
export type LogStatus = 'success' | 'failed' | 'running';

// 任务接口类型
export interface Task {
  taskid: string;
  sourceid: string;
  source_type: string;
  code: string;
  version: number;
  created_at: string;
  source: {
    name: string;
  };
}

// 任务日志接口类型
export interface TaskLog {
  logid: string;
  taskid: string;
  status: LogStatus;
  execution_time: string;
  duration_ms?: number;
  output?: string;
  error?: string;
  task?: Task;
  created_at: string;
  updated_at?: string;
}

// 获取日志列表参数接口
export interface GetLogsParams {
  page?: number;
  pageSize?: number;
  taskid?: number;
  status?: LogStatus;
  startDate?: string;
  endDate?: string;
}

// 日志分页结果接口
export interface LogsResponse {
  logs: TaskLog[];
  total: number;
}

// 获取日志列表
export const getLogs = async (params: GetLogsParams): Promise<LogsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/task-logs`, { params });
  return response.data;
};

// 获取日志详情
export const getLogDetail = async (logId: string): Promise<TaskLog> => {
  const response = await axios.get(`${API_BASE_URL}/task-logs/${logId}`);
  return response.data;
};

// 获取特定任务的日志
export const getLogsByTaskId = async (taskId: string): Promise<TaskLog[]> => {
  const response = await axios.get(`${API_BASE_URL}/task-logs/task/${taskId}`);
  return response.data;
};
