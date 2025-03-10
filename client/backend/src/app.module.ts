import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TopicsModule } from './topics/topics.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TopicsModule,
    SubscriptionsModule,
    AuthModule,
  ],
})
export class AppModule {}
