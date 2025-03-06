import request from '../utils/axios-config'
import { Task, TaskVersion } from '../types/task'

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  sourceId?: number;
  status?: string;
  keyword?: string;
}

export interface TaskListResponse {
  total: number;
  data: Task[];
}

export const getTasks = (params: TaskListParams) => {
  return request.get<TaskListResponse>('/tasks', { params });
};

export const getTaskDetail = (id: number) => {
  return request.get<Task>(`/tasks/${id}`);
};

export const createTask = (data: any) => {
  return request.post<Task>('/tasks', data);
};

export const updateTask = (id: number, data: any) => {
  return request.put<Task>(`/tasks/${id}`, data);
};

export const deleteTask = (id: number) => {
  return request.delete(`/tasks/${id}`);
};

export const getTaskVersions = (taskId: number) => {
  return request.get<TaskVersion[]>(`/tasks/${taskId}/versions`);
};

export const getTaskVersionDetail = (taskId: number, versionId: number) => {
  return request.get<TaskVersion>(`/tasks/${taskId}/versions/${versionId}`);
};

export const switchTaskVersion = (taskId: number, versionId: number) => {
  return request.put(`/tasks/${taskId}/versions/${versionId}/switch`);
};

export const executeTask = (taskId: number) => {
  return request.post(`/tasks/${taskId}/execute`);
};
