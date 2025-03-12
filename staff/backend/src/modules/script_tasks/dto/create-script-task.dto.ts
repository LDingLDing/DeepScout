import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ScriptTaskStatus } from '@entities';

export class CreateScriptTaskDto {
  @IsNotEmpty({ message: '脚本ID不能为空' })
  @IsNumber({}, { message: '脚本ID必须是数字' })
  scriptId: number;

  @IsOptional()
  @IsEnum(ScriptTaskStatus, { message: '无效的任务状态' })
  status?: ScriptTaskStatus;
}
