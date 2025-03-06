import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { SourceStatus, SourceType } from '../entities/source.entity';

export class CreateSourceDto {
  @IsNotEmpty({ message: '信息源名称不能为空' })
  @IsString()
  @MaxLength(100, { message: '信息源名称不能超过100个字符' })
  name: string;

  @IsNotEmpty({ message: '信息源类型不能为空' })
  @IsEnum(SourceType, { message: '无效的信息源类型' })
  type: SourceType;

  @IsOptional()
  @IsUrl({}, { message: '请输入有效的URL' })
  @MaxLength(255, { message: 'URL不能超过255个字符' })
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  config?: Record<string, any>;

  @IsOptional()
  @IsEnum(SourceStatus, { message: '无效的状态' })
  status?: SourceStatus;
}
