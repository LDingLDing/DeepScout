import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScriptFile } from '@entities/script_tasks/script-file.entity';
import { CreateScriptFileDto } from '../dto/create-script-file.dto';

@Injectable()
export class ScriptFileService {
  constructor(
    @InjectRepository(ScriptFile)
    private scriptFileRepository: Repository<ScriptFile>,
  ) {}

  async create(createScriptFileDto: CreateScriptFileDto): Promise<ScriptFile> {
    const scriptFile = this.scriptFileRepository.create(createScriptFileDto);
    return this.scriptFileRepository.save(scriptFile);
  }

  async findAll(): Promise<ScriptFile[]> {
    return this.scriptFileRepository.find({
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<ScriptFile> {
    const scriptFile = await this.scriptFileRepository.findOne({ where: { id } });
    if (!scriptFile) {
      throw new NotFoundException(`脚本文件 ID ${id} 不存在`);
    }
    return scriptFile;
  }

  async findByFileName(fileName: string): Promise<ScriptFile> {
    return this.scriptFileRepository.findOne({
      where: { file_name: fileName },
      order: { created_at: 'DESC' }
    });
  }

  async update(id: string, file: Partial<ScriptFile>) {
    return this.scriptFileRepository.update(id, file);
  }

  async remove(id: string) {
    return this.scriptFileRepository.delete(id);
  }
}
