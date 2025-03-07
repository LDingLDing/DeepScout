import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScriptTaskLog } from '../entities/script-task-log.entity';
import { CreateScriptTaskLogDto } from '../dto/create-script-task-log.dto';
import { ScriptTaskService } from './script-task.service';

@Injectable()
export class ScriptTaskLogService {
  constructor(
    @InjectRepository(ScriptTaskLog)
    private scriptTaskLogRepository: Repository<ScriptTaskLog>,
    private scriptTaskService: ScriptTaskService,
  ) {}

  async create(createScriptTaskLogDto: CreateScriptTaskLogDto): Promise<ScriptTaskLog> {
    // 验证任务是否存在
    await this.scriptTaskService.findOne(createScriptTaskLogDto.taskId);
    
    const scriptTaskLog = this.scriptTaskLogRepository.create(createScriptTaskLogDto);
    return this.scriptTaskLogRepository.save(scriptTaskLog);
  }

  async findByTaskId(taskId: number): Promise<ScriptTaskLog[]> {
    return this.scriptTaskLogRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' }
    });
  }
}
