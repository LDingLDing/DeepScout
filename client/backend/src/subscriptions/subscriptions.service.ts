import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '@entities/subscription/subscription.entity';
import { SubscriptionDto } from './dto/subscription.dto';
import { TopicsService } from '../topics/topics.service';
import { PaginatedSubscriptionsDto } from './dto/paginated-result.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly topicsService: TopicsService
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    topics: string[] = [],
    userId: string
  ): Promise<PaginatedSubscriptionsDto> {
    // 如果没有指定话题，获取用户订阅的所有话题
    if (topics.length === 0) {
      const subscribedTopics = await this.topicsService.findSubscribed(userId);
      topics = subscribedTopics.map(topic => topic.id);
    }

    // 构建查询
    const query = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.topic_id IN (:...topics)', { topics })
      .orderBy('subscription.publish_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // 执行查询
    const [items, total] = await query.getManyAndCount();

    // 计算是否还有更多数据
    const hasMore = total > page * limit;

    return {
      items: items.map(item => this.toDto(item)),
      total,
      page,
      limit,
      hasMore
    };
  }

  async findByTopicId(topic_id: string): Promise<SubscriptionDto[]> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { topic_id },
      order: {
        publish_time: 'DESC'
      }
    });
    
    return subscriptions.map(sub => this.toDto(sub));
  }

  async findOne(id: string): Promise<SubscriptionDto | undefined> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id }
    });
    
    return subscription ? this.toDto(subscription) : undefined;
  }

  private toDto(subscription: Subscription): SubscriptionDto {
    return {
      id: subscription.id,
      topic_id: subscription.topic_id,
      title: subscription.title,
      content: subscription.content,
      publish_time: subscription.publish_time.getTime(),
      read_time: subscription.read_time.getTime()
    };
  }
}
