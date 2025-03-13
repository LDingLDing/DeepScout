import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TopicsModule } from './topics/topics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { Topic } from '@entities/topic/topic.entity';
import { User } from '@entities/user/user.entity';
import { Subscription } from '@entities/subscription/subscription.entity';
import { SubscripTopic } from '@entities/topic/subscrip-topic.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '../../.env')], // 指向项目根目录的.env文件
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'deepscout'),
        entities: [Topic, User, Subscription, SubscripTopic],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TopicsModule,
    SubscriptionsModule,
    AuthModule,
    UserModule,
    EmailModule,
  ],
})
export class AppModule {}
