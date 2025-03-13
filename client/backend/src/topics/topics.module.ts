import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { Topic } from '@entities/topic/topic.entity';
import { SubscripTopic } from '@entities/topic/subscrip-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, SubscripTopic])],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService]
})
export class TopicsModule {}
