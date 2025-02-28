import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 全局管道，用于验证请求数据
  app.useGlobalPipes(new ValidationPipe());
  
  // 启用CORS
  app.enableCors();
  
  // API前缀
  app.setGlobalPrefix('api/v1');
  
  await app.listen(3001);
  console.log(`应用已启动: http://localhost:3001/`);
}
bootstrap();
