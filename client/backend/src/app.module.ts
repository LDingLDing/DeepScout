import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TopicsModule } from './topics/topics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TopicsModule,
    SubscriptionsModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
