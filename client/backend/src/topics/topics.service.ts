import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '@entities/topic/topic.entity';
import { SubscripTopic } from '@entities/topic/subscrip-topic.entity';
import { TopicDto } from './dto/topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(SubscripTopic)
    private readonly subscripTopicRepository: Repository<SubscripTopic>
  ) {}

  async findAll(): Promise<TopicDto[]> {
    const topics = await this.topicRepository.find();
    return topics.map(topic => this.toDto(topic));
  }

  async findSubscribed(userId: string): Promise<TopicDto[]> {
    const subscriptions = await this.subscripTopicRepository.find({
      where: { user_id: userId },
      relations: ['topic'],
    });
    
    const subscribedTopics = subscriptions.map(sub => sub.topic);
    return subscribedTopics.map(topic => this.toDto(topic, true));
  }

  async findOne(id: string): Promise<TopicDto | undefined> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    return topic ? this.toDto(topic) : undefined;
  }

  async toggleSubscription(id: string, userId: string): Promise<TopicDto | undefined> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      return undefined;
    }

    // 查找是否已存在订阅
    const existingSubscription = await this.subscripTopicRepository.findOne({
      where: { topic_id: id, user_id: userId }
    });

    if (existingSubscription) {
      // 如果已订阅，则取消订阅
      await this.subscripTopicRepository.remove(existingSubscription);
      return this.toDto(topic, false);
    } else {
      // 如果未订阅，则添加订阅
      const newSubscription = this.subscripTopicRepository.create({
        topic_id: id,
        user_id: userId
      });
      await this.subscripTopicRepository.save(newSubscription);
      return this.toDto(topic, true);
    }
  }

  private toDto(topic: Topic, is_subscribed: boolean = false): TopicDto {
    return {
      id: topic.id,
      title: topic.title,
      description: topic.description,
      image_url: topic.image_url,
      hot: topic.hot,
      is_subscribed: is_subscribed,
    };
  }
}
