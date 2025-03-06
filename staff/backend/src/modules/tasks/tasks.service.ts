import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { TaskVersion } from './entities/task-version.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SourcesService } from '../sources/sources.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskVersion)
    private taskVersionRepository: Repository<TaskVersion>,
    private sourcesService: SourcesService,
    private dataSource: DataSource,
  ) {}

  async create(createTaskDto: CreateTaskDto, staffId: number): Promise<Task> {
    // 检查信息源是否存在
    await this.sourcesService.findOne(createTaskDto.sourceId);
    
    // 使用事务确保任务和版本同时创建成功
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 创建任务
      const task = this.taskRepository.create({
        name: createTaskDto.name,
        sourceId: createTaskDto.sourceId,
        description: createTaskDto.description,
        schedule: createTaskDto.schedule,
        status: createTaskDto.status || TaskStatus.INACTIVE,
        createdBy: staffId,
      });
      
      const savedTask = await queryRunner.manager.save(task);
      
      // 创建任务版本
      const taskVersion = this.taskVersionRepository.create({
        taskId: savedTask.id,
        version: 1, // 初始版本为1
        code: createTaskDto.code,
        config: createTaskDto.config,
        comment: createTaskDto.comment || '初始版本',
        createdBy: staffId,
      });
      
      const savedVersion = await queryRunner.manager.save(taskVersion);
      
      // 更新任务的当前版本ID
      savedTask.currentVersionId = savedVersion.id;
      await queryRunner.manager.save(savedTask);
      
      await queryRunner.commitTransaction();
      
      return savedTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: {
    page?: number;
    pageSize?: number;
    sourceId?: number;
    status?: string;
    keyword?: string;
  }): Promise<{ total: number; data: any[] }> {
    const { page = 1, pageSize = 20, sourceId, status, keyword } = query;
    
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .select([
        'task.id',
        'task.name',
        'task.sourceId',
        'task.status',
        'task.lastRunAt',
        'task.nextRunAt',
        'task.createdAt',
        'creator.id',
        'creator.username',
      ]);
    
    if (sourceId) {
      queryBuilder.andWhere('task.sourceId = :sourceId', { sourceId });
    }
    
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }
    
    if (keyword) {
      queryBuilder.andWhere('(task.name ILIKE :keyword OR task.description ILIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
    
    const total = await queryBuilder.getCount();
    
    const tasks = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    // 获取关联的信息源名称
    const data = await Promise.all(tasks.map(async (task) => {
      try {
        const source = await this.sourcesService.findOne(task.sourceId);
        return {
          ...task,
          sourceName: source.name,
        };
      } catch (error) {
        return {
          ...task,
          sourceName: '未知信息源',
        };
      }
    }));
    
    return { total, data };
  }

  async findOne(id: number): Promise<any> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    
    if (!task) {
      throw new NotFoundException(`任务 ID ${id} 不存在`);
    }
    
    // 获取信息源名称
    try {
      const source = await this.sourcesService.findOne(task.sourceId);
      return {
        ...task,
        sourceName: source.name,
        currentVersion: task.currentVersionId ? await this.getTaskVersionNumber(task.currentVersionId) : null,
      };
    } catch (error) {
      return {
        ...task,
        sourceName: '未知信息源',
        currentVersion: task.currentVersionId ? await this.getTaskVersionNumber(task.currentVersionId) : null,
      };
    }
  }

  private async getTaskVersionNumber(versionId: number): Promise<number> {
    const version = await this.taskVersionRepository.findOne({ where: { id: versionId } });
    return version ? version.version : null;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, staffId: number): Promise<Task> {
    const task = await this.findOne(id);
    
    // 如果更新了信息源ID，检查信息源是否存在
    if (updateTaskDto.sourceId) {
      await this.sourcesService.findOne(updateTaskDto.sourceId);
    }
    
    // 如果提供了代码，创建新版本
    if (updateTaskDto.code) {
      return this.createNewVersion(task, updateTaskDto, staffId);
    }
    
    // 否则只更新任务基本信息
    const updateData: any = {};
    
    if (updateTaskDto.name) updateData.name = updateTaskDto.name;
    if (updateTaskDto.sourceId) updateData.sourceId = updateTaskDto.sourceId;
    if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
    if (updateTaskDto.schedule !== undefined) updateData.schedule = updateTaskDto.schedule;
    if (updateTaskDto.status) updateData.status = updateTaskDto.status;
    
    updateData.updatedBy = staffId;
    
    Object.assign(task, updateData);
    
    return this.taskRepository.save(task);
  }

  private async createNewVersion(task: Task, updateTaskDto: UpdateTaskDto, staffId: number): Promise<Task> {
    // 获取当前最高版本号
    const latestVersion = await this.taskVersionRepository.findOne({
      where: { taskId: task.id },
      order: { version: 'DESC' },
    });
    
    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;
    
    // 使用事务确保任务和版本同时更新成功
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 创建新版本
      const taskVersion = this.taskVersionRepository.create({
        taskId: task.id,
        version: newVersionNumber,
        code: updateTaskDto.code,
        config: updateTaskDto.config,
        comment: updateTaskDto.comment || `版本 ${newVersionNumber}`,
        createdBy: staffId,
      });
      
      const savedVersion = await queryRunner.manager.save(taskVersion);
      
      // 更新任务信息
      const updateData: any = {
        currentVersionId: savedVersion.id,
        updatedBy: staffId,
      };
      
      if (updateTaskDto.name) updateData.name = updateTaskDto.name;
      if (updateTaskDto.sourceId) updateData.sourceId = updateTaskDto.sourceId;
      if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
      if (updateTaskDto.schedule !== undefined) updateData.schedule = updateTaskDto.schedule;
      if (updateTaskDto.status) updateData.status = updateTaskDto.status;
      
      Object.assign(task, updateData);
      
      await queryRunner.manager.save(task);
      
      await queryRunner.commitTransaction();
      
      return task;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    return { success: true, message: '任务已删除' };
  }

  async getTaskVersions(taskId: number): Promise<TaskVersion[]> {
    const task = await this.findOne(taskId);
    
    return this.taskVersionRepository.find({
      where: { taskId },
      relations: ['creator'],
      order: { version: 'DESC' },
    });
  }

  async getTaskVersionDetail(taskId: number, versionId: number): Promise<TaskVersion> {
    const version = await this.taskVersionRepository.findOne({
      where: { id: versionId, taskId },
      relations: ['creator'],
    });
    
    if (!version) {
      throw new NotFoundException(`任务版本不存在`);
    }
    
    return version;
  }

  async switchVersion(taskId: number, versionId: number, staffId: number): Promise<Task> {
    const task = await this.findOne(taskId);
    const version = await this.getTaskVersionDetail(taskId, versionId);
    
    task.currentVersionId = version.id;
    task.updatedBy = staffId;
    
    return this.taskRepository.save(task);
  }

  async executeTask(taskId: number): Promise<{ success: boolean; message: string }> {
    // 这里只是一个示例，实际执行任务的逻辑需要根据您的系统设计来实现
    const task = await this.findOne(taskId);
    
    if (task.status !== TaskStatus.ACTIVE) {
      throw new BadRequestException('只能执行处于活动状态的任务');
    }
    
    // 更新最后执行时间
    task.lastRunAt = new Date();
    await this.taskRepository.save(task);
    
    // 这里应该有实际执行任务的逻辑
    // 例如：发送消息到队列，或者调用爬虫服务等
    
    return { success: true, message: '任务已提交执行' };
  }
}
