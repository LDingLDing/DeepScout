import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

/**
 * 用户控制器
 */
export class UserController {
  /**
   * 创建用户
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { nickname } = req.body;
      
      if (!nickname) {
        res.status(400).json({ error: '昵称不能为空' });
        return;
      }
      
      const userid = await UserService.createUser(nickname);
      
      res.status(201).json({ userid, message: '用户创建成功' });
    } catch (error) {
      console.error('创建用户失败:', error);
      res.status(500).json({ error: '创建用户失败' });
    }
  }

  /**
   * 获取用户信息
   */
  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userid = parseInt(req.params.userid);
      
      if (isNaN(userid)) {
        res.status(400).json({ error: '无效的用户ID' });
        return;
      }
      
      const user = await UserService.getUserById(userid);
      
      if (!user) {
        res.status(404).json({ error: '用户不存在' });
        return;
      }
      
      res.json(user);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({ error: '获取用户信息失败' });
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userid = parseInt(req.params.userid);
      const { nickname } = req.body;
      
      if (isNaN(userid)) {
        res.status(400).json({ error: '无效的用户ID' });
        return;
      }
      
      if (!nickname) {
        res.status(400).json({ error: '昵称不能为空' });
        return;
      }
      
      const success = await UserService.updateUser(userid, nickname);
      
      if (!success) {
        res.status(404).json({ error: '用户不存在或更新失败' });
        return;
      }
      
      res.json({ message: '用户信息更新成功' });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({ error: '更新用户信息失败' });
    }
  }

  /**
   * 获取用户订阅
   */
  static async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const userid = parseInt(req.params.userid);
      const status = req.query.status as string;
      
      if (isNaN(userid)) {
        res.status(400).json({ error: '无效的用户ID' });
        return;
      }
      
      // 验证状态参数
      if (status && !['active', 'inactive'].includes(status)) {
        res.status(400).json({ error: '无效的状态参数' });
        return;
      }
      
      const subscriptions = await UserService.getUserSubscriptions(
        userid,
        status as 'active' | 'inactive' | undefined
      );
      
      res.json(subscriptions);
    } catch (error) {
      console.error('获取用户订阅失败:', error);
      res.status(500).json({ error: '获取用户订阅失败' });
    }
  }

  /**
   * 添加用户订阅
   */
  static async addSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userid = parseInt(req.params.userid);
      const { sourceid, frequency } = req.body;
      
      if (isNaN(userid) || isNaN(parseInt(sourceid))) {
        res.status(400).json({ error: '无效的用户ID或信息源ID' });
        return;
      }
      
      if (!frequency) {
        res.status(400).json({ error: 'Cron表达式不能为空' });
        return;
      }
      
      const success = await UserService.addSubscription(
        userid,
        parseInt(sourceid),
        frequency
      );
      
      if (!success) {
        res.status(404).json({ error: '用户或信息源不存在，或订阅已存在' });
        return;
      }
      
      res.status(201).json({ message: '订阅添加成功' });
    } catch (error) {
      console.error('添加用户订阅失败:', error);
      res.status(500).json({ error: '添加用户订阅失败' });
    }
  }

  /**
   * 更新用户订阅
   */
  static async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userid = parseInt(req.params.userid);
      const sourceid = parseInt(req.params.sourceid);
      const { frequency, status } = req.body;
      
      if (isNaN(userid) || isNaN(sourceid)) {
        res.status(400).json({ error: '无效的用户ID或信息源ID' });
        return;
      }
      
      let success = false;
      
      // 更新频率
      if (frequency) {
        success = await UserService.updateSubscription(userid, sourceid, frequency);
      }
      
      // 更新状态
      if (status && ['active', 'inactive'].includes(status)) {
        success = await UserService.updateSubscriptionStatus(
          userid,
          sourceid,
          status as 'active' | 'inactive'
        );
      }
      
      if (!success) {
        res.status(404).json({ error: '订阅不存在或更新失败' });
        return;
      }
      
      res.json({ message: '订阅更新成功' });
    } catch (error) {
      console.error('更新用户订阅失败:', error);
      res.status(500).json({ error: '更新用户订阅失败' });
    }
  }

  /**
   * 取消用户订阅
   */
  static async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userid = parseInt(req.params.userid);
      const sourceid = parseInt(req.params.sourceid);
      
      if (isNaN(userid) || isNaN(sourceid)) {
        res.status(400).json({ error: '无效的用户ID或信息源ID' });
        return;
      }
      
      const success = await UserService.cancelSubscription(userid, sourceid);
      
      if (!success) {
        res.status(404).json({ error: '订阅不存在或取消失败' });
        return;
      }
      
      res.json({ message: '订阅取消成功' });
    } catch (error) {
      console.error('取消用户订阅失败:', error);
      res.status(500).json({ error: '取消用户订阅失败' });
    }
  }

  /**
   * 获取用户订阅的最新任务
   */
  static async getUserLatestTasks(req: Request, res: Response): Promise<void> {
    try {
      const userid = parseInt(req.params.userid);
      
      if (isNaN(userid)) {
        res.status(400).json({ error: '无效的用户ID' });
        return;
      }
      
      const tasks = await UserService.getUserLatestTasks(userid);
      
      res.json(tasks);
    } catch (error) {
      console.error('获取用户最新任务失败:', error);
      res.status(500).json({ error: '获取用户最新任务失败' });
    }
  }
}
