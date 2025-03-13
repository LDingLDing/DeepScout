import { Injectable, ForbiddenException } from '@nestjs/common';
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
    // 获取用户订阅的所有话题
    const subscribedTopics = await this.topicsService.findSubscribed(userId);
    const subscribedTopicIds = subscribedTopics.map(topic => topic.id);

    // 如果指定了话题，验证用户是否有权限访问这些话题
    const validTopics = topics.length > 0
      ? topics.filter(id => subscribedTopicIds.includes(id))
      : subscribedTopicIds;

    // 如果没有有效的话题，返回空结果
    if (validTopics.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };
    }

    // 构建查询
    const query = this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.topic_id IN (:...validTopics)', { validTopics })
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

  async findByTopicId(topic_id: string, userId: string): Promise<SubscriptionDto[]> {
    // 验证用户是否订阅了该话题
    const subscribedTopics = await this.topicsService.findSubscribed(userId);
    const isSubscribed = subscribedTopics.some(topic => topic.id === topic_id);
    
    if (!isSubscribed) {
      throw new ForbiddenException('You do not have access to this topic');
    }

    const subscriptions = await this.subscriptionRepository.find({
      where: { topic_id },
      order: {
        publish_time: 'DESC'
      }
    });
    
    return subscriptions.map(sub => this.toDto(sub));
  }

  async findOne(id: string, userId: string): Promise<SubscriptionDto | undefined> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id }
    });
    
    if (!subscription) {
      return undefined;
    }

    // 验证用户是否订阅了该内容所属的话题
    const subscribedTopics = await this.topicsService.findSubscribed(userId);
    const isSubscribed = subscribedTopics.some(topic => topic.id === subscription.topic_id);
    
    if (!isSubscribed) {
      throw new ForbiddenException('You do not have access to this subscription');
    }

    return this.toDto(subscription);
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
