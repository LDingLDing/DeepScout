import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScriptFileDto {
  @ApiProperty({
    description: '脚本文件名',
    example: 'data-sync',
  })
  @IsNotEmpty({ message: '文件名不能为空' })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: '脚本内容',
    example: 'print("Hello, World!")',
  })
  @IsNotEmpty({ message: '脚本内容不能为空' })
  @IsString()
  content: string;
}
