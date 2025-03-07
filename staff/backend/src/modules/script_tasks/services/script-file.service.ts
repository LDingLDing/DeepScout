import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScriptFile } from '../entities/script-file.entity';
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
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<ScriptFile> {
    const scriptFile = await this.scriptFileRepository.findOne({ where: { id } });
    if (!scriptFile) {
      throw new NotFoundException(`脚本文件 ID ${id} 不存在`);
    }
    return scriptFile;
  }

  async findLatestByFileName(fileName: string): Promise<ScriptFile> {
    return this.scriptFileRepository.findOne({
      where: { fileName },
      order: { createdAt: 'DESC' }
    });
  }
}
