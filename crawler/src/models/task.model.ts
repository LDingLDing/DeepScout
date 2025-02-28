/**
 * 监控任务目标
 */
export interface TaskTarget {
  url: string;
  selector?: string;
}

/**
 * 任务调度配置
 */
export interface TaskSchedule {
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
}

/**
 * 监控任务定义
 */
export interface Task {
  id: string;
  name: string;
  extract_rules: string;
  targets: TaskTarget[];
  schedule: TaskSchedule;
  status: 'pending' | 'running' | 'completed' | 'failed';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 爬取结果
 */
export interface CrawlResult {
  taskId: string;
  url: string;
  timestamp: Date;
  success: boolean;
  html?: string;
  screenshot?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * 处理后的结构化数据
 */
export interface ProcessedData {
  taskId: string;
  sourceUrl: string;
  timestamp: Date;
  data: Record<string, any>;
  raw?: CrawlResult;
}

export default {
  Task,
  TaskTarget,
  TaskSchedule,
  CrawlResult,
  ProcessedData
};
