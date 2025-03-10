// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟话题数据
const mockTopics = [
  {
    id: '1',
    title: '前端开发',
    description: '关于Web前端开发的最新技术、框架和最佳实践',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    subscribers: 12500,
    hot: true,
    isSubscribed: false,
  },
  {
    id: '2',
    title: '人工智能',
    description: '探讨AI技术发展、机器学习算法和应用案例',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    subscribers: 8300,
    hot: true,
    isSubscribed: true,
  },
  {
    id: '3',
    title: '云原生',
    description: '关于容器化、微服务架构和云计算的技术讨论',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    subscribers: 5600,
    hot: false,
    isSubscribed: false,
  },
  {
    id: '4',
    title: '区块链',
    description: '探讨区块链技术、加密货币和去中心化应用',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    subscribers: 3200,
    hot: false,
    isSubscribed: false,
  },
];

// 模拟订阅内容数据
const mockSubscriptions = [
  {
    id: '1',
    topicId: '2',
    title: '2024年AI发展趋势报告',
    content: '随着大语言模型的突破，AI技术在2024年迎来了新的发展机遇。本报告深入分析了生成式AI、多模态模型、AI安全等重要领域的最新进展，并对未来发展方向进行了预测。通过实际案例研究，我们发现AI在企业中的应用已经从实验阶段逐步走向规模化落地...',
    publishTime: '2024-03-10T09:00:00.000Z',
    readTime: '5分钟阅读',
  },
  {
    id: '2',
    topicId: '2',
    title: 'GPT-4的技术原理解析',
    content: 'GPT-4采用了更先进的Transformer架构，通过自注意力机制提升了模型性能。相比前代模型，GPT-4在上下文理解、推理能力和知识应用等方面都有显著提升。本文将从技术角度详细解析GPT-4的核心创新，包括模型架构改进、训练方法优化以及新的应用场景...',
    publishTime: '2024-03-09T14:30:00.000Z',
    readTime: '8分钟阅读',
  },
  {
    id: '3',
    topicId: '1',
    title: '现代前端工程化实践指南',
    content: '随着前端项目规模的不断扩大，工程化已成为团队开发的必要实践。本文将介绍现代前端工程化的核心概念，包括构建工具选择、代码规范配置、自动化测试策略、CI/CD流程搭建等关键环节。通过实际项目经验，我们总结了一套适用于大型前端项目的工程化最佳实践...',
    publishTime: '2024-03-08T10:15:00.000Z',
    readTime: '10分钟阅读',
  },
];

export const fetchTopics = async () => {
  await delay(500);
  return mockTopics;
};

export const fetchSubscriptions = async () => {
  await delay(500);
  return mockSubscriptions;
};

export const login = async (email: string, code: string) => {
  await delay(1000);
  if (code === '123456') {
    return {
      token: 'mock_token',
      email,
    };
  }
  throw new Error('验证码错误');
};

export const sendVerificationCode = async (email: string) => {
  await delay(1000);
  return true;
};
