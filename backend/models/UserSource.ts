import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 用户关注状态
export type SubscriptionStatus = 'active' | 'inactive';

// 用户关注关系接口
export interface UserSource {
  userid: number;
  sourceid: number;
  frequency: string; // Cron表达式
  status?: SubscriptionStatus;
  created_at?: Date;
  updated_at?: Date;
}

// 用户关注关系模型类
export class UserSourceModel {
  /**
   * 创建用户关注关系
   * @param userSource 用户关注关系信息
   * @returns 是否创建成功
   */
  static async create(userSource: UserSource): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO user_source (userid, sourceid, frequency, status) VALUES (?, ?, ?, ?)',
        [
          userSource.userid,
          userSource.sourceid,
          userSource.frequency,
          userSource.status || 'active'
        ]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('创建用户关注关系失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户关注关系
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @returns 用户关注关系信息
   */
  static async get(userid: number, sourceid: number): Promise<UserSource | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM user_source WHERE userid = ? AND sourceid = ?',
        [userid, sourceid]
      );
      
      return rows.length > 0 ? rows[0] as UserSource : null;
    } catch (error) {
      console.error('获取用户关注关系失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的所有关注
   * @param userid 用户ID
   * @param status 可选的状态过滤
   * @returns 用户关注列表
   */
  static async getUserSubscriptions(userid: number, status?: SubscriptionStatus): Promise<UserSource[]> {
    try {
      let query = 'SELECT * FROM user_source WHERE userid = ?';
      const params: any[] = [userid];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      return rows as UserSource[];
    } catch (error) {
      console.error('获取用户关注列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取信息源的所有关注用户
   * @param sourceid 信息源ID
   * @param status 可选的状态过滤
   * @returns 关注用户列表
   */
  static async getSourceSubscribers(sourceid: number, status?: SubscriptionStatus): Promise<UserSource[]> {
    try {
      let query = 'SELECT * FROM user_source WHERE sourceid = ?';
      const params: any[] = [sourceid];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      return rows as UserSource[];
    } catch (error) {
      console.error('获取信息源关注用户列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户关注关系
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @param userSource 更新的关注关系信息
   * @returns 是否更新成功
   */
  static async update(userid: number, sourceid: number, userSource: Partial<UserSource>): Promise<boolean> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      
      if (userSource.frequency !== undefined) {
        updateFields.push('frequency = ?');
        params.push(userSource.frequency);
      }
      
      if (userSource.status !== undefined) {
        updateFields.push('status = ?');
        params.push(userSource.status);
      }
      
      if (updateFields.length === 0) {
        return false;
      }
      
      params.push(userid, sourceid);
      
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE user_source SET ${updateFields.join(', ')} WHERE userid = ? AND sourceid = ?`,
        params
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新用户关注关系失败:', error);
      throw error;
    }
  }

  /**
   * 更新关注状态
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @param status 新状态
   * @returns 是否更新成功
   */
  static async updateStatus(userid: number, sourceid: number, status: SubscriptionStatus): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE user_source SET status = ? WHERE userid = ? AND sourceid = ?',
        [status, userid, sourceid]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新关注状态失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户关注关系
   * @param userid 用户ID
   * @param sourceid 信息源ID
   * @returns 是否删除成功
   */
  static async delete(userid: number, sourceid: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM user_source WHERE userid = ? AND sourceid = ?',
        [userid, sourceid]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除用户关注关系失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户关注的详细信息（包括信息源信息）
   * @param userid 用户ID
   * @param status 可选的状态过滤
   * @returns 用户关注的详细信息
   */
  static async getUserSubscriptionsWithDetails(userid: number, status?: SubscriptionStatus): Promise<any[]> {
    try {
      let query = `
        SELECT us.*, s.name as source_name, s.created_at as source_created_at
        FROM user_source us
        JOIN sources s ON us.sourceid = s.sourceid
        WHERE us.userid = ?
      `;
      const params: any[] = [userid];
      
      if (status) {
        query += ' AND us.status = ?';
        params.push(status);
      }
      
      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      return rows;
    } catch (error) {
      console.error('获取用户关注详细信息失败:', error);
      throw error;
    }
  }
}
