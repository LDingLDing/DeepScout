import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsNotEmpty({ message: '任务名称不能为空' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: '信息源ID不能为空' })
  @IsNumber({}, { message: '信息源ID必须是数字' })
  sourceId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: '采集代码不能为空' })
  @IsString()
  code: string;

  @IsOptional()
  config?: Record<string, any>;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: '无效的任务状态' })
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
