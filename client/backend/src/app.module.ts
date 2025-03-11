import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TopicsModule } from './topics/topics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TopicsModule,
    SubscriptionsModule,
    AuthModule,
    UserModule,
    EmailModule,
  ],
})
export class AppModule {}
