import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ScriptFile } from '@entities';
import { ScriptTask, ScriptTaskStatus } from '@entities';
import { ScriptTaskLog, ScriptTaskLogStatus } from '@entities';
import { CreateScriptFileDto } from './dto/create-script-file.dto';
import { CreateScriptTaskDto } from './dto/create-script-task.dto';
import { CreateScriptTaskLogDto } from './dto/create-script-task-log.dto';

@Injectable()
export class ScriptTasksService {
  constructor(
    @InjectRepository(ScriptFile)
    private scriptFileRepository: Repository<ScriptFile>,
    @InjectRepository(ScriptTask)
    private scriptTaskRepository: Repository<ScriptTask>,
    @InjectRepository(ScriptTaskLog)
    private scriptTaskLogRepository: Repository<ScriptTaskLog>,
    private dataSource: DataSource,
  ) {}

  // 脚本文件相关方法
  async createScriptFile(createScriptFileDto: CreateScriptFileDto, staffId: number): Promise<ScriptFile> {
    const scriptFile = this.scriptFileRepository.create({
      ...createScriptFileDto,
    });
    return this.scriptFileRepository.save(scriptFile);
  }

  async findAllScriptFiles(query: {
    page?: number;
    pageSize?: number;
    fileName?: string;
  }): Promise<{ total: number; data: ScriptFile[] }> {
    const { page = 1, pageSize = 20, fileName } = query;
    
    const queryBuilder = this.scriptFileRepository.createQueryBuilder('file')
      .leftJoinAndSelect('file.creator', 'creator')
      .select([
        'file.id',
        'file.fileName',
        'file.content',
        'file.createdAt',
        'creator.id',
        'creator.name',
      ]);
    
    if (fileName) {
      queryBuilder.andWhere('file.fileName ILIKE :fileName', { fileName: `%${fileName}%` });
    }
    
    const total = await queryBuilder.getCount();
    
    const files = await queryBuilder
      .orderBy('file.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    return { total, data: files };
  }

  async findScriptFileById(id: number): Promise<ScriptFile> {
    const file = await this.scriptFileRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    
    if (!file) {
      throw new NotFoundException(`脚本文件 ID ${id} 不存在`);
    }
    
    return file;
  }

  // 脚本任务相关方法
  async createScriptTask(createScriptTaskDto: CreateScriptTaskDto, staffId: number): Promise<ScriptTask> {
    // 检查脚本文件是否存在
    await this.findScriptFileById(createScriptTaskDto.scriptId);
    
    const task = this.scriptTaskRepository.create({
      ...createScriptTaskDto,
      status: createScriptTaskDto.status || ScriptTaskStatus.PENDING,
    });
    
    return this.scriptTaskRepository.save(task);
  }

  async findAllScriptTasks(query: {
    page?: number;
    pageSize?: number;
    status?: ScriptTaskStatus;
    scriptId?: number;
  }): Promise<{ total: number; data: ScriptTask[] }> {
    const { page = 1, pageSize = 20, status, scriptId } = query;
    
    const queryBuilder = this.scriptTaskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.script', 'script')
      .leftJoinAndSelect('task.creator', 'creator')
      .select([
        'task.id',
        'task.status',
        'task.createdAt',
        'task.updatedAt',
        'script.id',
        'script.fileName',
        'creator.id',
        'creator.name',
      ]);
    
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }
    
    if (scriptId) {
      queryBuilder.andWhere('task.scriptId = :scriptId', { scriptId });
    }
    
    const total = await queryBuilder.getCount();
    
    const tasks = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    return { total, data: tasks };
  }

  async findScriptTaskById(id: number): Promise<ScriptTask> {
    const task = await this.scriptTaskRepository.findOne({
      where: { id },
      relations: ['script', 'creator'],
    });
    
    if (!task) {
      throw new NotFoundException(`脚本任务 ID ${id} 不存在`);
    }
    
    return task;
  }

  async updateScriptTaskStatus(id: number, status: ScriptTaskStatus, staffId: number): Promise<ScriptTask> {
    const task = await this.findScriptTaskById(id);
    
    task.status = status;
    
    return this.scriptTaskRepository.save(task);
  }

  // 任务日志相关方法
  async createScriptTaskLog(createScriptTaskLogDto: CreateScriptTaskLogDto): Promise<ScriptTaskLog> {
    // 检查任务是否存在
    await this.findScriptTaskById(createScriptTaskLogDto.taskId);
    
    const log = this.scriptTaskLogRepository.create(createScriptTaskLogDto);
    return this.scriptTaskLogRepository.save(log);
  }

  async findScriptTaskLogs(taskId: number, query: {
    page?: number;
    pageSize?: number;
    status?: ScriptTaskLogStatus;
  }): Promise<{ total: number; data: ScriptTaskLog[] }> {
    const { page = 1, pageSize = 20, status } = query;
    
    const queryBuilder = this.scriptTaskLogRepository.createQueryBuilder('log')
      .where('log.taskId = :taskId', { taskId })
      .select([
        'log.id',
        'log.content',
        'log.status',
        'log.createdAt',
      ]);
    
    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }
    
    const total = await queryBuilder.getCount();
    
    const logs = await queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    return { total, data: logs };
  }

  // 执行任务
  async executeScriptTask(taskId: number, staffId: number): Promise<{ success: boolean; message: string }> {
    const task = await this.findScriptTaskById(taskId);
    
    if (task.status !== ScriptTaskStatus.PENDING) {
      throw new BadRequestException('只能执行待处理状态的任务');
    }
    
    // 开始执行任务
    await this.updateScriptTaskStatus(taskId, ScriptTaskStatus.RUNNING, staffId);
    
    try {
      // 记录开始执行日志
      await this.createScriptTaskLog({
        taskId,
        content: '任务开始执行',
        status: ScriptTaskLogStatus.INFO,
      });
      
      // TODO: 这里应该有实际执行任务的逻辑
      // 例如：发送消息到队列，或者调用执行器服务等
      
      return { success: true, message: '任务已开始执行' };
    } catch (error) {
      // 记录错误日志
      await this.createScriptTaskLog({
        taskId,
        content: `执行出错：${error.message}`,
        status: ScriptTaskLogStatus.ERROR,
      });
      
      // 更新任务状态为失败
      await this.updateScriptTaskStatus(taskId, ScriptTaskStatus.FAILED, staffId);
      
      throw error;
    }
  }
}