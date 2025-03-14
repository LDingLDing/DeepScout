import { DataSource, LessThanOrEqual } from 'typeorm';
import * as schedule from 'node-schedule';
import { ScriptTask, ScriptTaskStatus } from '@entities/script_tasks/script-task.entity';
import { SandboxExecutor } from '../sandbox/SandboxExecutor';
import { Logger } from '../utils/logger';

export class TaskScheduler {
  private dataSource: DataSource;
  private sandboxExecutor: SandboxExecutor;
  private logger: Logger;
  private isProcessing: boolean = false;
  private maxConcurrency: number = 1; // 当前设置为1，未来可扩展
  private currentRunning: number = 0;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.sandboxExecutor = new SandboxExecutor(dataSource);
    this.logger = new Logger();
  }

  public async start() {
    // 初始检查一次
    this.processNextTask();

    // 设置定期检查，确保即使所有任务都执行完毕后仍能继续检查新任务
    this.checkInterval = setInterval(() => {
      if (!this.isProcessing && this.currentRunning < this.maxConcurrency) {
        this.processNextTask();
      }
    }, 60000); // 每分钟检查一次
  }

  public stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async processNextTask() {
    // 如果已经在处理或达到最大并发数，则跳过
    if (this.isProcessing || this.currentRunning >= this.maxConcurrency) {
      return;
    }

    this.isProcessing = true;

    try {
      const taskRepository = this.dataSource.getRepository(ScriptTask);
      // 只获取一个最接近执行时间的任务
      const nextTask = await taskRepository.findOne({
        where: {
          status: ScriptTaskStatus.PENDING,
          expected_run_time: LessThanOrEqual(new Date())
        },
        relations: ['script'],
        order: {
          expected_run_time: 'ASC' // 按执行时间升序排序，取最早的
        }
      });

      // 如果有待执行的任务，则执行它
      if (nextTask) {
        this.logger.info(`Processing task ${nextTask.id} scheduled for ${nextTask.expected_run_time}`);
        this.currentRunning++;
        this.isProcessing = false; // 释放检查锁，允许检查下一个任务

        try {
          await this.executeTask(nextTask);
        } finally {
          this.currentRunning--;
          // 任务执行完毕后，立即检查下一个任务
          setTimeout(() => this.processNextTask(), 0);
        }
      } else {
        this.logger.info('No pending tasks found');
        this.isProcessing = false;
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Error processing next task:', error);
      }
      this.isProcessing = false;
    }
  }

  private async executeTask(task: ScriptTask) {
    const taskRepository = this.dataSource.getRepository(ScriptTask);
    try {
      // 更新任务状态为运行中
      await taskRepository.update(task.id, {
        status: ScriptTaskStatus.RUNNING,
        started_at: new Date()
      });

      // 执行脚本
      await this.sandboxExecutor.execute(task.script.content, task.id);

      // 更新任务状态为完成
      await taskRepository.update(task.id, {
        status: ScriptTaskStatus.COMPLETED,
        finished_at: new Date()
      });

      this.logger.info(`Task ${task.id} completed successfully`);
    } catch (error) {
      if (error instanceof Error) {
        // 更新任务状态为失败
        await taskRepository.update(task.id, {
          status: ScriptTaskStatus.FAILED,
          finished_at: new Date()
        });
        this.logger.error(`Task ${task.id} failed: ${error.message}`);
      }
      throw error;
    }
  }
} 