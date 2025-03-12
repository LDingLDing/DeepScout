import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StaffService } from './modules/staff/staff.service';
import { StaffRole } from './entities/staff_user/staff-user.entity';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const staffService = app.get(StaffService);
  const configService = app.get(ConfigService);

  try {
    // 检查是否已存在超级管理员
    const defaultEmail = configService.get('ADMIN_EMAIL', 'admin@example.com');
    const defaultPassword = configService.get('ADMIN_PASSWORD', 'admin123');
    const defaultName = configService.get('ADMIN_NAME', 'Administrator');
    
    const existingAdmin = await staffService.findByEmail(defaultEmail);
    
    if (!existingAdmin) {
      // 创建超级管理员
      await staffService.create({
        email: defaultEmail,
        password: defaultPassword,
        name: defaultName,
        role: StaffRole.ADMIN,
      });
      console.log('超级管理员创建成功！');
      console.log(`邮箱: ${defaultEmail}`);
      console.log(`密码: ${defaultPassword}`);
      console.log(`姓名: ${defaultName}`);
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
