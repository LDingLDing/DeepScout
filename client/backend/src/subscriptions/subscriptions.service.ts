import { Injectable } from '@nestjs/common';
import { SubscriptionDto } from './dto/subscription.dto';
import { TopicsService } from '../topics/topics.service';
import { PaginatedSubscriptionsDto } from './dto/paginated-result.dto';

const mockContent = '2024年，人工智能（AI）领域迎来了前所未有的快速发展，技术突破与应用场景的深度融合正在重塑全球产业格局。以下是对2024年AI发展趋势的全面解析。\n\n## 一、技术突破加速AGI临近\n\n### 1. 推理能力跃升\n大模型从训练转向深度推理优化，OpenAI的o1模型通过强化学习和思维链技术显著提升了复杂问题的解决能力。国产大模型如DeepSeek通过"开源+低成本"策略打破技术垄断，推动全球AI治理话语权重构。\n\n### 2. 数据与算法革新\n合成数据弥补了高质量数据稀缺的问题，结合推理计算提升了模型效率。缩放法则在多模态、生物数据等维度持续拓展，驱动模型与数据的飞轮效应。';

@Injectable()
export class SubscriptionsService {
  private subscriptions: SubscriptionDto[] = [
    {
      id: '1',
      topicId: '2',
      title: '2024年AI发展趋势报告',
      content: mockContent,
      publishTime: 1710032400000,
      readTime: 300,
    },
    {
      id: '2',
      topicId: '2',
      title: 'GPT-4的技术原理解析',
      content: mockContent,
      publishTime: 1709967000000,
      readTime: 480,
    },
    {
      id: '3',
      topicId: '1',
      title: '现代前端工程化实践指南',
      content: mockContent,
      publishTime: 1709867700000,
      readTime: 600,
    },
    {
      id: '4',
      topicId: '1',
      title: 'React 18新特性详解',
      content: mockContent,
      publishTime: 1709781300000,
      readTime: 450,
    },
    {
      id: '5',
      topicId: '3',
      title: '云原生架构设计模式',
      content: mockContent,
      publishTime: 1709694900000,
      readTime: 520,
    },
    {
      id: '6',
      topicId: '3',
      title: 'Kubernetes最佳实践',
      content: mockContent,
      publishTime: 1709608500000,
      readTime: 480,
    },
    {
      id: '7',
      topicId: '2',
      title: '机器学习模型部署策略',
      content: mockContent,
      publishTime: 1709522100000,
      readTime: 350,
    },
    {
      id: '8',
      topicId: '1',
      title: 'TypeScript高级类型编程',
      content: mockContent,
      publishTime: 1709435700000,
      readTime: 420,
    },
    {
      id: '9',
      topicId: '3',
      title: '微服务架构实战',
      content: mockContent,
      publishTime: 1709349300000,
      readTime: 500,
    },
    {
      id: '10',
      topicId: '2',
      title: '深度学习框架比较',
      content: mockContent,
      publishTime: 1709262900000,
      readTime: 380,
    },
    {
      id: '11',
      topicId: '1',
      title: 'Next.js应用开发指南',
      content: mockContent,
      publishTime: 1709176500000,
      readTime: 450,
    },
    {
      id: '12',
      topicId: '3',
      title: 'DevOps最佳实践',
      content: mockContent,
      publishTime: 1709090100000,
      readTime: 480,
    },
    {
      id: '13',
      topicId: '2',
      title: '大模型微调技术详解',
      content: mockContent,
      publishTime: 1709003700000,
      readTime: 520,
    },
    {
      id: '14',
      topicId: '1',
      title: 'CSS架构设计模式',
      content: mockContent,
      publishTime: 1708917300000,
      readTime: 380,
    },
    {
      id: '15',
      topicId: '3',
      title: '容器安全最佳实践',
      content: mockContent,
      publishTime: 1708830900000,
      readTime: 420,
    },
  ];

  constructor(private readonly topicsService: TopicsService) {}

  findAll(page = 1, limit = 10): PaginatedSubscriptionsDto {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = this.subscriptions.length;
    
    const items = this.subscriptions.slice(startIndex, endIndex);
    const hasMore = endIndex < total;
    
    return {
      items,
      total,
      page,
      limit,
      hasMore,
    };
  }

  findByTopicId(topicId: string): SubscriptionDto[] {
    return this.subscriptions.filter(sub => sub.topicId === topicId);
  }

  findOne(id: string): SubscriptionDto | undefined {
    return this.subscriptions.find(sub => sub.id === id);
  }
}
