import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

// 信息源类型
export type SourceType = 'web' | 'rss' | 'wechat';

// 采集任务接口
export interface Task {
  taskid?: number;
  sourceid: number;
  source_type: SourceType;
  code: string;
  version?: number;
  created_at?: Date;
}

// 采集任务模型类
export class TaskModel {
  /**
   * 创建新采集任务
   * @param task 任务信息
   * @returns 创建的任务ID
   */
  static async create(task: Task): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 获取当前最大版本号
      const [versionRows] = await connection.execute<RowDataPacket[]>(
        'SELECT MAX(version) as maxVersion FROM tasks WHERE sourceid = ? AND source_type = ?',
        [task.sourceid, task.source_type]
      );
      
      const currentVersion = versionRows[0].maxVersion || 0;
      const newVersion = currentVersion + 1;
      
      // 插入新任务
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO tasks (sourceid, source_type, code, version) VALUES (?, ?, ?, ?)',
        [task.sourceid, task.source_type, task.code, newVersion]
      );
      
      await connection.commit();
      
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.error('创建任务失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 智能创建任务（仅当代码有变更时才创建新版本）
   * @param task 任务信息
   * @returns 创建的任务ID或现有任务ID
   */
  static async smartCreate(task: Task): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 获取最新版本的任务
      const [latestTasks] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM tasks WHERE sourceid = ? AND source_type = ? ORDER BY version DESC LIMIT 1',
        [task.sourceid, task.source_type]
      );
      
      // 如果没有现有任务，直接创建
      if (latestTasks.length === 0) {
        const [result] = await connection.execute<ResultSetHeader>(
          'INSERT INTO tasks (sourceid, source_type, code, version) VALUES (?, ?, ?, ?)',
          [task.sourceid, task.source_type, task.code, 1]
        );
        
        await connection.commit();
        return result.insertId;
      }
      
      const latestTask = latestTasks[0] as Task;
      
      // 计算代码哈希值进行比较
      const latestCodeHash = crypto.createHash('md5').update(latestTask.code).digest('hex');
      const newCodeHash = crypto.createHash('md5').update(task.code).digest('hex');
      
      // 如果代码没有变化，返回现有任务ID
      if (latestCodeHash === newCodeHash) {
        await connection.commit();
        return latestTask.taskid!;
      }
      
      // 代码有变化，创建新版本
      const newVersion = latestTask.version! + 1;
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO tasks (sourceid, source_type, code, version) VALUES (?, ?, ?, ?)',
        [task.sourceid, task.source_type, task.code, newVersion]
      );
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.error('智能创建任务失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 根据ID获取任务
   * @param taskid 任务ID
   * @returns 任务信息
   */
  static async getById(taskid: number): Promise<Task | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tasks WHERE taskid = ?',
        [taskid]
      );
      
      return rows.length > 0 ? rows[0] as Task : null;
    } catch (error) {
      console.error('获取任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取信息源的最新任务
   * @param sourceid 信息源ID
   * @param source_type 信息源类型
   * @returns 最新任务信息
   */
  static async getLatestTask(sourceid: number, source_type: SourceType): Promise<Task | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tasks WHERE sourceid = ? AND source_type = ? ORDER BY version DESC LIMIT 1',
        [sourceid, source_type]
      );
      
      return rows.length > 0 ? rows[0] as Task : null;
    } catch (error) {
      console.error('获取最新任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取信息源的所有任务
   * @param sourceid 信息源ID
   * @param source_type 可选的信息源类型
   * @returns 任务列表
   */
  static async getBySource(sourceid: number, source_type?: SourceType): Promise<Task[]> {
    try {
      let query = 'SELECT * FROM tasks WHERE sourceid = ?';
      const params: any[] = [sourceid];
      
      if (source_type) {
        query += ' AND source_type = ?';
        params.push(source_type);
      }
      
      query += ' ORDER BY source_type, version DESC';
      
      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      return rows as Task[];
    } catch (error) {
      console.error('获取信息源任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务历史版本
   * @param sourceid 信息源ID
   * @param source_type 信息源类型
   * @returns 任务版本列表
   */
  static async getTaskHistory(sourceid: number, source_type: SourceType): Promise<Task[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM tasks WHERE sourceid = ? AND source_type = ? ORDER BY version DESC',
        [sourceid, source_type]
      );
      
      return rows as Task[];
    } catch (error) {
      console.error('获取任务历史版本失败:', error);
      throw error;
    }
  }

  /**
   * 删除任务
   * @param taskid 任务ID
   * @returns 是否删除成功
   */
  static async delete(taskid: number): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 先删除关联的任务日志
      await connection.execute(
        'DELETE FROM task_logs WHERE taskid = ?',
        [taskid]
      );
      
      // 删除任务
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM tasks WHERE taskid = ?',
        [taskid]
      );
      
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('删除任务失败:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}
