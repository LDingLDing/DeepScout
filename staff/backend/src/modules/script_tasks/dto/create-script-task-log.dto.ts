import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ScriptTaskLogStatus } from '@entities';

export class CreateScriptTaskLogDto {
  @IsNotEmpty({ message: '任务ID不能为空' })
  @IsString({ message: '任务ID必须是字符串' })
  taskId: string;

  @IsNotEmpty({ message: '日志内容不能为空' })
  @IsString()
  content: string;

  @IsEnum(ScriptTaskLogStatus, { message: '无效的日志状态' })
  status: ScriptTaskLogStatus;
}
