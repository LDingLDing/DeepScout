import { Source, SourceModel } from '../models/Source';
import { Task, TaskModel, SourceType } from '../models/Task';
import { UserSourceModel } from '../models/UserSource';

/**
 * 信息源服务类
 */
export class SourceService {
  /**
   * 创建新信息源
   * @param name 信息源名称
   * @returns 创建的信息源ID
   */
  static async createSource(name: string): Promise<number> {
    return await SourceModel.create({ name });
  }

  /**
   * 获取所有信息源
   * @returns 信息源列表
   */
  static async getAllSources(): Promise<Source[]> {
    return await SourceModel.getAll();
  }

  /**
   * 获取信息源详情
   * @param sourceid 信息源ID
   * @returns 信息源详情
   */
  static async getSourceDetails(sourceid: number): Promise<any | null> {
    try {
      // 获取信息源基本信息
      const source = await SourceModel.getById(sourceid);
      
      if (!source) {
        return null;
      }
      
      // 获取信息源的任务
      const tasks = await TaskModel.getBySource(sourceid);
      
      // 获取信息源的订阅用户数量
      const subscribers = await UserSourceModel.getSourceSubscribers(sourceid);
      
      // 组装详细信息
      return {
        ...source,
        tasks: tasks.map(task => ({
          taskid: task.taskid,
          source_type: task.source_type,
          version: task.version,
          created_at: task.created_at
        })),
        subscriberCount: subscribers.length
      };
    } catch (error) {
      console.error('获取信息源详情失败:', error);
      throw error;
    }
  }

  /**
   * 更新信息源
   * @param sourceid 信息源ID
   * @param name 新名称
   * @returns 是否更新成功
   */
  static async updateSource(sourceid: number, name: string): Promise<boolean> {
    return await SourceModel.update(sourceid, { name });
  }

  /**
   * 删除信息源（包括关联的任务和订阅关系）
   * @param sourceid 信息源ID
   * @returns 是否删除成功
   */
  static async deleteSource(sourceid: number): Promise<boolean> {
    return await SourceModel.safeDelete(sourceid);
  }

  /**
   * 创建信息源的采集任务
   * @param sourceid 信息源ID
   * @param source_type 信息源类型
   * @param code 采集代码
   * @returns 创建的任务ID
   */
  static async createSourceTask(sourceid: number, source_type: SourceType, code: string): Promise<number> {
    return await TaskModel.create({
      sourceid,
      source_type,
      code
    });
  }

  /**
   * 智能创建信息源的采集任务（仅当代码有变更时才创建新版本）
   * @param sourceid 信息源ID
   * @param source_type 信息源类型
   * @param code 采集代码
   * @returns 任务ID
   */
  static async smartCreateSourceTask(sourceid: number, source_type: SourceType, code: string): Promise<number> {
    return await TaskModel.smartCreate({
      sourceid,
      source_type,
      code
    });
  }

  /**
   * 获取信息源的最新任务
   * @param sourceid 信息源ID
   * @param source_type 信息源类型
   * @returns 最新任务
   */
  static async getLatestSourceTask(sourceid: number, source_type: SourceType): Promise<Task | null> {
    return await TaskModel.getLatestTask(sourceid, source_type);
  }

  /**
   * 获取信息源的任务历史
   * @param sourceid 信息源ID
   * @param source_type 信息源类型
   * @returns 任务历史
   */
  static async getSourceTaskHistory(sourceid: number, source_type: SourceType): Promise<Task[]> {
    return await TaskModel.getTaskHistory(sourceid, source_type);
  }
}
