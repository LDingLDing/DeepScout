import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 用户接口
export interface User {
  userid?: number;
  nickname: string;
  created_at?: Date;
}

// 用户模型类
export class UserModel {
  /**
   * 创建新用户
   * @param user 用户信息
   * @returns 创建的用户ID
   */
  static async create(user: User): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO users (nickname) VALUES (?)',
        [user.nickname]
      );
      return result.insertId;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取用户
   * @param userid 用户ID
   * @returns 用户信息
   */
  static async getById(userid: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE userid = ?',
        [userid]
      );
      
      return rows.length > 0 ? rows[0] as User : null;
    } catch (error) {
      console.error('获取用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有用户
   * @returns 用户列表
   */
  static async getAll(): Promise<User[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users');
      return rows as User[];
    } catch (error) {
      console.error('获取所有用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param userid 用户ID
   * @param user 更新的用户信息
   * @returns 是否更新成功
   */
  static async update(userid: number, user: Partial<User>): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET nickname = ? WHERE userid = ?',
        [user.nickname, userid]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新用户失败:', error);
      throw error;
    }
  }
}
