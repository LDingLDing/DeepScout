import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 全局管道，用于验证请求数据
  app.useGlobalPipes(new ValidationPipe());
  
  // 启用CORS
  app.enableCors();
  
  // API前缀
  app.setGlobalPrefix('api/v1');
  
  const port = configService.get('STAFF_BACKEND_PORT', 3003);
  await app.listen(port);
  console.log(`应用已启动: http://localhost:${port}/`);
}
bootstrap();
