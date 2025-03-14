import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ScriptTaskStatus } from '@entities';

export class CreateScriptTaskDto {
  @IsNotEmpty({ message: '脚本ID不能为空' })
  @IsString({ message: '脚本ID必须是字符串' })
  scriptId: string;

  @IsOptional()
  @IsEnum(ScriptTaskStatus, { message: '无效的任务状态' })
  status?: ScriptTaskStatus;
}
