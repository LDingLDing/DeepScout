import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 信息源接口
export interface Source {
  sourceid?: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

// 信息源模型类
export class SourceModel {
  /**
   * 创建新信息源
   * @param source 信息源信息
   * @returns 创建的信息源ID
   */
  static async create(source: Source): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO sources (name) VALUES (?)',
        [source.name]
      );
      return result.insertId;
    } catch (error) {
      console.error('创建信息源失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取信息源
   * @param sourceid 信息源ID
   * @returns 信息源信息
   */
  static async getById(sourceid: number): Promise<Source | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM sources WHERE sourceid = ?',
        [sourceid]
      );
      
      return rows.length > 0 ? rows[0] as Source : null;
    } catch (error) {
      console.error('获取信息源失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有信息源
   * @returns 信息源列表
   */
  static async getAll(): Promise<Source[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM sources');
      return rows as Source[];
    } catch (error) {
      console.error('获取所有信息源失败:', error);
      throw error;
    }
  }

  /**
   * 更新信息源
   * @param sourceid 信息源ID
   * @param source 更新的信息源信息
   * @returns 是否更新成功
   */
  static async update(sourceid: number, source: Partial<Source>): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE sources SET name = ? WHERE sourceid = ?',
        [source.name, sourceid]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新信息源失败:', error);
      throw error;
    }
  }

  /**
   * 删除信息源
   * @param sourceid 信息源ID
   * @returns 是否删除成功
   */
  static async delete(sourceid: number): Promise<boolean> {
    try {
      // 注意：这里应该先删除关联的任务和用户关注关系
      // 或者使用事务来确保数据一致性
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM sources WHERE sourceid = ?',
        [sourceid]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除信息源失败:', error);
      throw error;
    }
  }

  /**
   * 安全删除信息源（检查是否有关联数据）
   * @param sourceid 信息源ID
   * @returns 是否删除成功
   */
  static async safeDelete(sourceid: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 检查是否有关联的任务
      const [tasks] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM tasks WHERE sourceid = ?',
        [sourceid]
      );
      
      if (tasks[0].count > 0) {
        // 删除关联的任务
        await connection.execute(
          'DELETE FROM task_logs WHERE taskid IN (SELECT taskid FROM tasks WHERE sourceid = ?)',
          [sourceid]
        );
        
        await connection.execute(
          'DELETE FROM tasks WHERE sourceid = ?',
          [sourceid]
        );
      }
      
      // 删除用户关注关系
      await connection.execute(
        'DELETE FROM user_source WHERE sourceid = ?',
        [sourceid]
      );
      
      // 删除信息源
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM sources WHERE sourceid = ?',
        [sourceid]
      );
      
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('安全删除信息源失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
