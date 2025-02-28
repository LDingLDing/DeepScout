import api from './index';
import { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task';

// 获取所有任务
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

// 获取单个任务
export const getTaskById = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

// 创建任务
export const createTask = async (task: TaskCreateInput): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

// 更新任务
export const updateTask = async (id: string, task: TaskUpdateInput): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

// 删除任务
export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

// 获取任务执行结果
export const getTaskResults = async (id: string): Promise<any[]> => {
  const response = await api.get(`/tasks/${id}/results`);
  return response.data;
};

// 手动执行任务
export const runTask = async (id: string): Promise<void> => {
  await api.post(`/tasks/${id}/run`);
};

// 暂停任务
export const pauseTask = async (id: string): Promise<void> => {
  await api.post(`/tasks/${id}/pause`);
};

// 恢复任务
export const resumeTask = async (id: string): Promise<void> => {
  await api.post(`/tasks/${id}/resume`);
};

// 获取任务统计信息
export const getTaskStats = async (): Promise<any> => {
  const response = await api.get('/tasks/stats');
  return response.data;
};
