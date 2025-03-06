import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source, SourceStatus } from './entities/source.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
  ) {}

  async create(createSourceDto: CreateSourceDto, staffId: number): Promise<Source> {
    const source = this.sourceRepository.create({
      ...createSourceDto,
      createdBy: staffId,
    });
    return this.sourceRepository.save(source);
  }

  async findAll(query: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    keyword?: string;
  }): Promise<{ total: number; data: Source[] }> {
    const { page = 1, pageSize = 20, type, status, keyword } = query;
    
    const queryBuilder = this.sourceRepository.createQueryBuilder('source');
    
    if (type) {
      queryBuilder.andWhere('source.type = :type', { type });
    }
    
    if (status) {
      queryBuilder.andWhere('source.status = :status', { status });
    }
    
    if (keyword) {
      queryBuilder.andWhere('(source.name ILIKE :keyword OR source.description ILIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
    
    const total = await queryBuilder.getCount();
    
    const data = await queryBuilder
      .orderBy('source.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    return { total, data };
  }

  async findOne(id: number): Promise<Source> {
    const source = await this.sourceRepository.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException(`信息源 ID ${id} 不存在`);
    }
    return source;
  }

  async update(id: number, updateSourceDto: UpdateSourceDto, staffId: number): Promise<Source> {
    const source = await this.findOne(id);
    
    Object.assign(source, {
      ...updateSourceDto,
      updatedBy: staffId,
    });
    
    return this.sourceRepository.save(source);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const source = await this.findOne(id);
    await this.sourceRepository.remove(source);
    return { success: true, message: '信息源已删除' };
  }
}
