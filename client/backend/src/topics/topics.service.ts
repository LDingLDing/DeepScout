import { Injectable } from '@nestjs/common';
import { TopicDto } from './dto/topic.dto';

@Injectable()
export class TopicsService {
  private topics: TopicDto[] = [
    {
      id: '1',
      title: '前端开发',
      description: '关于Web前端开发的最新技术、框架和最佳实践',
      imageUrl: 'https://picsum.photos/400/300?random=1',
      hot: true,
      isSubscribed: false,
    },
    {
      id: '2',
      title: '人工智能',
      description: '探讨AI技术发展、机器学习算法和应用案例',
      imageUrl: 'https://picsum.photos/400/300?random=2',
      hot: true,
      isSubscribed: true,
    },
    {
      id: '3',
      title: '云原生',
      description: '关于容器化、微服务架构和云计算的技术讨论',
      imageUrl: 'https://picsum.photos/400/300?random=3',
      hot: false,
      isSubscribed: false,
    },
    {
      id: '4',
      title: '区块链',
      description: '探讨区块链技术、加密货币和去中心化应用',
      imageUrl: 'https://picsum.photos/400/300?random=4',
      hot: false,
      isSubscribed: false,
    },
  ];

  findAll(): TopicDto[] {
    return this.topics;
  }

  findOne(id: string): TopicDto | undefined {
    return this.topics.find(topic => topic.id === id);
  }

  // 模拟订阅/取消订阅功能
  toggleSubscription(id: string): TopicDto | undefined {
    const topic = this.topics.find(topic => topic.id === id);
    if (topic) {
      topic.isSubscribed = !topic.isSubscribed;
    }
    return topic;
  }
}
