import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 任务执行状态
export type TaskStatus = 'success' | 'failed' | 'running';

// 任务执行日志接口
export interface TaskLog {
  logid?: number;
  taskid: number;
  status: TaskStatus;
  error_message?: string;
  start_time: Date;
  end_time?: Date;
}

// 任务执行日志模型类
export class TaskLogModel {
  /**
   * 创建任务执行日志
   * @param taskLog 任务日志信息
   * @returns 创建的日志ID
   */
  static async create(taskLog: TaskLog): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO task_logs (taskid, status, error_message, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
        [
          taskLog.taskid,
          taskLog.status,
          taskLog.error_message || null,
          taskLog.start_time,
          taskLog.end_time || null
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建任务日志失败:', error);
      throw error;
    }
  }

  /**
   * 开始任务执行记录
   * @param taskid 任务ID
   * @returns 创建的日志ID
   */
  static async startTask(taskid: number): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO task_logs (taskid, status, start_time) VALUES (?, ?, NOW())',
        [taskid, 'running']
      );
      
      return result.insertId;
    } catch (error) {
      console.error('开始任务记录失败:', error);
      throw error;
    }
  }

  /**
   * 完成任务执行记录
   * @param logid 日志ID
   * @param status 任务状态
   * @param error_message 可选的错误信息
   * @returns 是否更新成功
   */
  static async completeTask(logid: number, status: TaskStatus, error_message?: string): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE task_logs SET status = ?, error_message = ?, end_time = NOW() WHERE logid = ?',
        [status, error_message || null, logid]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('完成任务记录失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取任务日志
   * @param logid 日志ID
   * @returns 任务日志信息
   */
  static async getById(logid: number): Promise<TaskLog | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM task_logs WHERE logid = ?',
        [logid]
      );
      
      return rows.length > 0 ? rows[0] as TaskLog : null;
    } catch (error) {
      console.error('获取任务日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取任务的执行历史
   * @param taskid 任务ID
   * @param limit 限制返回数量
   * @returns 任务执行历史列表
   */
  static async getTaskHistory(taskid: number, limit: number = 10): Promise<TaskLog[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM task_logs WHERE taskid = ? ORDER BY start_time DESC LIMIT ?',
        [taskid, limit]
      );
      
      return rows as TaskLog[];
    } catch (error) {
      console.error('获取任务执行历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取最近的任务执行记录
   * @param limit 限制返回数量
   * @returns 最近的任务执行记录
   */
  static async getRecentLogs(limit: number = 20): Promise<any[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT tl.*, t.sourceid, t.source_type, s.name as source_name
        FROM task_logs tl
        JOIN tasks t ON tl.taskid = t.taskid
        JOIN sources s ON t.sourceid = s.sourceid
        ORDER BY tl.start_time DESC
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      console.error('获取最近任务执行记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取失败的任务执行记录
   * @param limit 限制返回数量
   * @returns 失败的任务执行记录
   */
  static async getFailedLogs(limit: number = 20): Promise<any[]> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(`
        SELECT tl.*, t.sourceid, t.source_type, s.name as source_name
        FROM task_logs tl
        JOIN tasks t ON tl.taskid = t.taskid
        JOIN sources s ON t.sourceid = s.sourceid
        WHERE tl.status = 'failed'
        ORDER BY tl.start_time DESC
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      console.error('获取失败任务执行记录失败:', error);
      throw error;
    }
  }

  /**
   * 删除任务日志
   * @param logid 日志ID
   * @returns 是否删除成功
   */
  static async delete(logid: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM task_logs WHERE logid = ?',
        [logid]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除任务日志失败:', error);
      throw error;
    }
  }

  /**
   * 清理旧的任务日志
   * @param days 保留天数
   * @returns 删除的记录数
   */
  static async cleanupOldLogs(days: number = 30): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM task_logs WHERE start_time < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [days]
      );
      
      return result.affectedRows;
    } catch (error) {
      console.error('清理旧任务日志失败:', error);
      throw error;
    }
  }
}
