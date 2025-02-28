import axios from 'axios';
import * as cron from 'node-cron';
import { Task } from '../models/task.model';
import { Crawler } from './crawler';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { processData } from './dataProcessor';

// 任务调度器
class Scheduler {
  private tasks: Map<string, Task> = new Map();
  private activeTasks: Set<string> = new Set();
  private crawler: Crawler;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.crawler = new Crawler();
  }

  /**
   * 初始化调度器
   */
  async initialize(): Promise<void> {
    try {
      logger.info('正在初始化任务调度器...');
      
      // 设置定时拉取任务
      this.schedulePullTasks();
      
      // 初始化时拉取一次任务
      await this.pullTasks();
      
      logger.info('任务调度器初始化完成');
    } catch (error) {
      logger.error('任务调度器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 安排定时拉取任务
   */
  private schedulePullTasks(): void {
    // 定时拉取任务，每分钟检查一次
    setInterval(() => {
      this.pullTasks();
    }, config.scheduler.pullInterval);
  }

  /**
   * 从后端拉取待处理任务
   */
  private async pullTasks(): Promise<void> {
    try {
      logger.info('正在从后端拉取任务...');
      
      const response = await axios.get(
        `${config.api.backendUrl}/tasks/pending`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200 && response.data) {
        const tasks = response.data as Task[];
        logger.info(`拉取到 ${tasks.length} 个待处理任务`);
        
        // 处理每个任务
        for (const task of tasks) {
          this.addTask(task);
        }
      }
    } catch (error) {
      logger.error('拉取任务失败:', error);
    }
  }

  /**
   * 添加新任务
   */
  private addTask(task: Task): void {
    try {
      // 检查任务是否已存在
      if (this.tasks.has(task.id)) {
        logger.info(`任务 [${task.id}] 已存在，更新任务配置`);
        
        // 如果已经有计划任务，取消它
        const existingCron = this.cronJobs.get(task.id);
        if (existingCron) {
          existingCron.stop();
          this.cronJobs.delete(task.id);
        }
      } else {
        logger.info(`添加新任务 [${task.id}]: ${task.name}`);
      }
      
      // 更新任务
      this.tasks.set(task.id, task);
      
      // 根据调度频率创建计划任务
      this.scheduleCronJob(task);
    } catch (error) {
      logger.error(`添加任务 [${task.id}] 失败:`, error);
    }
  }

  /**
   * 根据任务频率创建定时任务
   */
  private scheduleCronJob(task: Task): void {
    try {
      // 生成cron表达式
      let cronExpression: string;
      
      switch (task.schedule.frequency) {
        case 'hourly':
          cronExpression = '0 * * * *'; // 每小时
          break;
        case 'daily':
          cronExpression = '0 0 * * *'; // 每天午夜
          break;
        case 'weekly':
          cronExpression = '0 0 * * 1'; // 每周一
          break;
        case 'monthly':
          cronExpression = '0 0 1 * *'; // 每月1日
          break;
        case 'once':
        default:
          // 对于一次性任务，立即执行
          this.executeTask(task);
          return;
      }
      
      // 创建定时任务
      const job = cron.schedule(cronExpression, () => {
        this.executeTask(task);
      }, {
        timezone: task.schedule.timezone
      });
      
      // 存储计划任务
      this.cronJobs.set(task.id, job);
      
      logger.info(`任务 [${task.id}] 已调度，频率: ${task.schedule.frequency}`);
    } catch (error) {
      logger.error(`调度任务 [${task.id}] 失败:`, error);
    }
  }

  /**
   * 执行任务
   */
  private async executeTask(task: Task): Promise<void> {
    try {
      // 检查任务是否已经在执行
      if (this.activeTasks.has(task.id)) {
        logger.info(`任务 [${task.id}] 正在执行，跳过`);
        return;
      }
      
      // 标记任务为活跃状态
      this.activeTasks.add(task.id);
      
      // 更新任务状态为运行中
      await this.updateTaskStatus(task.id, 'running');
      
      logger.info(`开始执行任务 [${task.id}]: ${task.name}`);
      
      // 创建结果数组
      const results = [];
      
      // 对每个目标URL执行爬取
      for (const target of task.targets) {
        try {
          // 如果已达到并发限制，等待
          while (this.activeTasks.size > config.scheduler.concurrentTasks) {
            await new Promise(r => setTimeout(r, 1000));
          }
          
          // 爬取目标
          const result = await this.crawler.crawl(task, target.url);
          
          // 如果爬取成功，处理数据
          if (result.success && result.html) {
            const processedData = await processData(task, result);
            
            // 发送数据到后端
            await this.sendDataToBackend(processedData);
          }
          
          results.push(result);
        } catch (error) {
          logger.error(`执行任务 [${task.id}] 目标 [${target.url}] 失败:`, error);
        }
      }
      
      // 更新任务状态为完成
      await this.updateTaskStatus(task.id, 'completed');
      
      logger.info(`任务 [${task.id}] 执行完成，成功爬取 ${results.filter(r => r.success).length}/${results.length} 个目标`);
    } catch (error) {
      logger.error(`执行任务 [${task.id}] 失败:`, error);
      
      // 更新任务状态为失败
      await this.updateTaskStatus(task.id, 'failed');
    } finally {
      // 移除活跃任务标记
      this.activeTasks.delete(task.id);
    }
  }

  /**
   * 更新任务状态
   */
  private async updateTaskStatus(taskId: string, status: 'pending' | 'running' | 'completed' | 'failed'): Promise<void> {
    try {
      await axios.patch(
        `${config.api.backendUrl}/tasks/${taskId}/status`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      logger.error(`更新任务 [${taskId}] 状态失败:`, error);
    }
  }

  /**
   * 发送处理后的数据到后端
   */
  private async sendDataToBackend(data: any): Promise<void> {
    try {
      await axios.post(
        `${config.api.backendUrl}/data`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      logger.error('发送数据到后端失败:', error);
    }
  }
}

// 全局调度器实例
const scheduler = new Scheduler();

/**
 * 初始化任务调度器
 */
export async function initializeScheduler(): Promise<void> {
  await scheduler.initialize();
}

export default { initializeScheduler };
