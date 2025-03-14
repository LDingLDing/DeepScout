import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScriptTask, ScriptTaskStatus } from '@entities';
import { CreateScriptTaskDto } from '../dto/create-script-task.dto';
import { ScriptFileService } from './script-file.service';

@Injectable()
export class ScriptTaskService {
  constructor(
    @InjectRepository(ScriptTask)
    private scriptTaskRepository: Repository<ScriptTask>,
    private scriptFileService: ScriptFileService,
  ) {}

  async create(createScriptTaskDto: CreateScriptTaskDto): Promise<ScriptTask> {
    // 验证脚本文件是否存在
    await this.scriptFileService.findOne(createScriptTaskDto.scriptId);
    
    const scriptTask = this.scriptTaskRepository.create({
      ...createScriptTaskDto,
      status: createScriptTaskDto.status || ScriptTaskStatus.PENDING
    });
    
    return this.scriptTaskRepository.save(scriptTask);
  }

  async findAll(): Promise<ScriptTask[]> {
    return this.scriptTaskRepository.find({
      relations: ['script'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<ScriptTask> {
    const scriptTask = await this.scriptTaskRepository.findOne({
      where: { id },
      relations: ['script']
    });
    
    if (!scriptTask) {
      throw new NotFoundException(`脚本任务 ID ${id} 不存在`);
    }
    
    return scriptTask;
  }

  async updateStatus(id: number, status: ScriptTaskStatus): Promise<ScriptTask> {
    const scriptTask = await this.findOne(id);
    scriptTask.status = status;
    return this.scriptTaskRepository.save(scriptTask);
  }

  async update(id: number, task: Partial<ScriptTask>) {
    return this.scriptTaskRepository.update(id, task);
  }

  async remove(id: number) {
    return this.scriptTaskRepository.delete(id);
  }
}
