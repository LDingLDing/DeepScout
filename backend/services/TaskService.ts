import { Task, TaskModel, SourceType } from '../models/Task';
import { TaskLog, TaskLogModel, TaskStatus } from '../models/TaskLog';
import { SourceModel } from '../models/Source';
import { UserSourceModel } from '../models/UserSource';

/**
 * 任务服务类
 */
export class TaskService {
  /**
   * 获取任务详情
   * @param taskid 任务ID
   * @returns 任务详情
   */
  static async getTaskDetails(taskid: number): Promise<any | null> {
    try {
      // 获取任务基本信息
      const task = await TaskModel.getById(taskid);
      
      if (!task) {
        return null;
      }
      
      // 获取信息源信息
      const source = await SourceModel.getById(task.sourceid);
      
      // 获取任务执行历史
      const logs = await TaskLogModel.getTaskHistory(taskid, 5);
      
      // 组装详细信息
      return {
        ...task,
        source,
        logs
      };
    } catch (error) {
      console.error('获取任务详情失败:', error);
      throw error;
    }
  }

  /**
   * 开始执行任务
   * @param taskid 任务ID
   * @returns 日志ID
   */
  static async startTaskExecution(taskid: number): Promise<number> {
    return await TaskLogModel.startTask(taskid);
  }

  /**
   * 完成任务执行
   * @param logid 日志ID
   * @param status 任务状态
   * @param error_message 可选的错误信息
   * @returns 是否更新成功
   */
  static async completeTaskExecution(logid: number, status: TaskStatus, error_message?: string): Promise<boolean> {
    return await TaskLogModel.completeTask(logid, status, error_message);
  }

  /**
   * 获取需要执行的任务
   * @returns 需要执行的任务列表
   */
  static async getTasksToExecute(): Promise<any[]> {
    try {
      // 获取所有活跃的用户订阅
      const activeSubscriptions = await UserSourceModel.getSourceSubscribers(undefined, 'active');
      
      // 按信息源分组
      const sourceMap = new Map<number, { frequency: string, users: number[] }[]>();
      
      for (const subscription of activeSubscriptions) {
        if (!sourceMap.has(subscription.sourceid)) {
          sourceMap.set(subscription.sourceid, []);
        }
        
        const sourceSubscriptions = sourceMap.get(subscription.sourceid)!;
        
        // 检查是否已有相同频率的订阅
        const existingFrequency = sourceSubscriptions.find(s => s.frequency === subscription.frequency);
        
        if (existingFrequency) {
          existingFrequency.users.push(subscription.userid);
        } else {
          sourceSubscriptions.push({
            frequency: subscription.frequency,
            users: [subscription.userid]
          });
        }
      }
      
      // 获取每个信息源的最新任务
      const tasksToExecute = [];
      
      for (const [sourceid, subscriptions] of sourceMap.entries()) {
        const source = await SourceModel.getById(sourceid);
        
        if (!source) {
          continue;
        }
        
        // 获取每种类型的最新任务
        const webTask = await TaskModel.getLatestTask(sourceid, 'web');
        const rssTask = await TaskModel.getLatestTask(sourceid, 'rss');
        const wechatTask = await TaskModel.getLatestTask(sourceid, 'wechat');
        
        // 添加到执行列表
        for (const subscription of subscriptions) {
          if (webTask) {
            tasksToExecute.push({
              task: webTask,
              source,
              frequency: subscription.frequency,
              users: subscription.users
            });
          }
          
          if (rssTask) {
            tasksToExecute.push({
              task: rssTask,
              source,
              frequency: subscription.frequency,
              users: subscription.users
            });
          }
          
          if (wechatTask) {
            tasksToExecute.push({
              task: wechatTask,
              source,
              frequency: subscription.frequency,
              users: subscription.users
            });
          }
        }
      }
      
      return tasksToExecute;
    } catch (error) {
      console.error('获取需要执行的任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取最近的任务执行记录
   * @param limit 限制返回数量
   * @returns 最近的任务执行记录
   */
  static async getRecentTaskLogs(limit: number = 20): Promise<any[]> {
    return await TaskLogModel.getRecentLogs(limit);
  }

  /**
   * 获取失败的任务执行记录
   * @param limit 限制返回数量
   * @returns 失败的任务执行记录
   */
  static async getFailedTaskLogs(limit: number = 20): Promise<any[]> {
    return await TaskLogModel.getFailedLogs(limit);
  }

  /**
   * 清理旧的任务日志
   * @param days 保留天数
   * @returns 删除的记录数
   */
  static async cleanupOldTaskLogs(days: number = 30): Promise<number> {
    return await TaskLogModel.cleanupOldLogs(days);
  }
}
