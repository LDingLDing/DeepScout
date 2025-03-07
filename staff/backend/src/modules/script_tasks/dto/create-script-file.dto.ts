import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScriptFileDto {
  @IsNotEmpty({ message: '文件名不能为空' })
  @IsString()
  fileName: string;

  @IsNotEmpty({ message: '脚本内容不能为空' })
  @IsString()
  content: string;
}
