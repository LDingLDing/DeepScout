import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 配置 Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('InfoRadar API')
    .setDescription('API Doc')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // 全局管道，用于验证请求数据
  app.useGlobalPipes(new ValidationPipe());
  
  // 启用CORS
  app.enableCors();
  
  // API前缀
  app.setGlobalPrefix('api/v1', {
    exclude: ['api-docs', 'api-docs/*'], // 排除 Swagger 路由
  });
  
  const port = configService.get('STAFF_BACKEND_PORT', 3003);
  await app.listen(port);
  console.log(`应用已启动: http://localhost:${port}/`);
  console.log(`Swagger 文档: http://localhost:${port}/api-docs`);
}
bootstrap();
