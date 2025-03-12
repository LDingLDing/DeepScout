import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ScriptTaskLogStatus } from '@entities';

export class CreateScriptTaskLogDto {
  @IsNotEmpty({ message: '任务ID不能为空' })
  @IsNumber({}, { message: '任务ID必须是数字' })
  taskId: number;

  @IsNotEmpty({ message: '日志内容不能为空' })
  @IsString()
  content: string;

  @IsEnum(ScriptTaskLogStatus, { message: '无效的日志状态' })
  status: ScriptTaskLogStatus;
}
