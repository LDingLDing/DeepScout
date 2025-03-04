import { User, UserModel } from '../models/User';
import { UserSource, UserSourceModel, SubscriptionStatus } from '../models/UserSource';
import { SourceModel } from '../models/Source';
import { TaskModel } from '../models/Task';

/**
 * 用户服务类
 */
export class UserService {
  /**
   * 创建新用户
   * @param nickname 用户昵称
   * @returns 创建的用户ID
   */
  static async createUser(nickname: string): Promise<number> {
    return await UserModel.create({ nickname });
  }

  /**
   * 获取用户信息
   * @param userid 用户ID
   * @returns 用户信息
   */
  static async getUserById(userid: number): Promise<User | null> {
    return await UserModel.getById(userid);
  }

  /**
   * 更新用户信息
   * @param userid 用户ID
   * @param nickname 新昵称
   * @returns 是否更新成功
   */
  static async updateUser(userid: number, nickname: string): Promise<boolean> {
    return await UserModel.update(userid, { nickname });
  }

  /**
   * 获取用户的订阅信息
   * @param userid 用户ID
   * @param status 可选的状态过滤
   * @returns 用户的订阅详情
   */
  static async getUserSubscriptions(userid: number, status?: SubscriptionStatus): Promise<any[]> {
    return await UserSourceModel.getUserSubscriptionsWithDetails(userid, status);
  }

  /**
   * 添加用户订阅
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @param frequency Cron表达式
   * @returns 是否添加成功
   */
  static async addSubscription(userid: number, sourceid: number, frequency: string): Promise<boolean> {
    // 检查用户和信息源是否存在
    const user = await UserModel.getById(userid);
    const source = await SourceModel.getById(sourceid);
    
    if (!user || !source) {
      return false;
    }
    
    return await UserSourceModel.create({
      userid,
      sourceid,
      frequency,
      status: 'active'
    });
  }

  /**
   * 更新用户订阅
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @param frequency 新的Cron表达式
   * @returns 是否更新成功
   */
  static async updateSubscription(userid: number, sourceid: number, frequency: string): Promise<boolean> {
    return await UserSourceModel.update(userid, sourceid, { frequency });
  }

  /**
   * 更新订阅状态
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @param status 新状态
   * @returns 是否更新成功
   */
  static async updateSubscriptionStatus(userid: number, sourceid: number, status: SubscriptionStatus): Promise<boolean> {
    return await UserSourceModel.updateStatus(userid, sourceid, status);
  }

  /**
   * 取消用户订阅
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @returns 是否取消成功
   */
  static async cancelSubscription(userid: number, sourceid: number): Promise<boolean> {
    return await UserSourceModel.delete(userid, sourceid);
  }

  /**
   * 获取用户订阅的最新任务
   * @param userid 用户ID
   * @returns 用户订阅的最新任务列表
   */
  static async getUserLatestTasks(userid: number): Promise<any[]> {
    try {
      // 获取用户的活跃订阅
      const subscriptions = await UserSourceModel.getUserSubscriptions(userid, 'active');
      
      // 获取每个订阅的最新任务
      const tasks = [];
      
      for (const subscription of subscriptions) {
        const webTask = await TaskModel.getLatestTask(subscription.sourceid, 'web');
        const rssTask = await TaskModel.getLatestTask(subscription.sourceid, 'rss');
        const wechatTask = await TaskModel.getLatestTask(subscription.sourceid, 'wechat');
        
        // 获取信息源信息
        const source = await SourceModel.getById(subscription.sourceid);
        
        tasks.push({
          subscription,
          source,
          tasks: {
            web: webTask,
            rss: rssTask,
            wechat: wechatTask
          }
        });
      }
      
      return tasks;
    } catch (error) {
      console.error('获取用户最新任务失败:', error);
      throw error;
    }
  }
}
