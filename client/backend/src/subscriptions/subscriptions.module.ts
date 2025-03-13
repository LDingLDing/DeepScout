import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from '@entities/subscription/subscription.entity';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    TopicsModule
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService]
})
export class SubscriptionsModule {}
