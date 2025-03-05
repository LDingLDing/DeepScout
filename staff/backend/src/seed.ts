import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StaffService } from './modules/staff/staff.service';
import { StaffRole } from './modules/staff/entities/staff.entity';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const staffService = app.get(StaffService);
  const configService = app.get(ConfigService);

  try {
    // 检查是否已存在超级管理员
    const defaultUsername = configService.get('ADMIN_USERNAME', 'admin');
    const defaultPassword = configService.get('ADMIN_PASSWORD', 'admin123');
    const defaultEmail = configService.get('ADMIN_EMAIL', 'admin@example.com');
    
    const existingAdmin = await staffService.findByUsername(defaultUsername);
    
    if (!existingAdmin) {
      // 创建超级管理员
      await staffService.create({
        username: defaultUsername,
        password: defaultPassword,
        email: defaultEmail,
        role: StaffRole.ADMIN,
      });
      console.log('超级管理员创建成功！');
      console.log(`用户名: ${defaultUsername}`);
      console.log(`密码: ${defaultPassword}`);
    } else {
      console.log('超级管理员已存在，跳过创建。');
    }
  } catch (error) {
    console.error('创建超级管理员时出错：', error);
  } finally {
    await app.close();
  }
}

bootstrap();
