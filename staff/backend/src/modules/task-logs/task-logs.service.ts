import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { TaskLog, TaskStatus } from './entities/task-log.entity';

@Injectable()
export class TaskLogsService {
  constructor(
    @InjectRepository(TaskLog)
    private taskLogRepository: Repository<TaskLog>,
  ) {}

  async findAll(skip?: number, take?: number, where?: FindOptionsWhere<TaskLog>): Promise<TaskLog[]> {
    return this.taskLogRepository.find({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TaskLog> {
    const taskLog = await this.taskLogRepository.findOne({ where: { id } });
    if (!taskLog) {
      throw new NotFoundException(`Task log with ID ${id} not found`);
    }
    return taskLog;
  }

  async create(createTaskLogDto: Partial<TaskLog>): Promise<TaskLog> {
    const taskLog = this.taskLogRepository.create(createTaskLogDto);
    return this.taskLogRepository.save(taskLog);
  }

  async update(id: number, updateTaskLogDto: Partial<TaskLog>): Promise<TaskLog> {
    const taskLog = await this.findOne(id);
    Object.assign(taskLog, updateTaskLogDto);
    return this.taskLogRepository.save(taskLog);
  }

  async remove(id: number): Promise<void> {
    const taskLog = await this.findOne(id);
    await this.taskLogRepository.remove(taskLog);
  }

  async findByTaskId(taskId: number, limit: number = 10): Promise<TaskLog[]> {
    return this.taskLogRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async findByStatus(status: TaskStatus): Promise<TaskLog[]> {
    return this.taskLogRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}
