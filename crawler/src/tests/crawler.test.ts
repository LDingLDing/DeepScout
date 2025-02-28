import { Crawler } from '../services/crawler';
import { Task } from '../models/task.model';
import { getCrawlerPool, initializeCrawlerPool } from '../services/crawlerPool';

// 模拟任务数据
const mockTask: Task = {
  id: 'test-task-id',
  name: '测试任务',
  extract_rules: '提取所有标题和链接',
  targets: [{ url: 'https://example.com' }],
  schedule: { frequency: 'once', timezone: 'Asia/Shanghai' },
  status: 'pending',
  userId: 'test-user',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('Crawler', () => {
  let crawler: Crawler;

  beforeAll(async () => {
    // 初始化爬虫池
    await initializeCrawlerPool();
    crawler = new Crawler();
  });

  it('should be defined', () => {
    expect(crawler).toBeDefined();
  });

  it('should crawl a webpage', async () => {
    // 此测试需要在实际环境中运行
    // 在CI环境中应该跳过或模拟
    const result = await crawler.crawl(mockTask, 'https://example.com');
    expect(result).toBeDefined();
    expect(result.taskId).toBe(mockTask.id);
    expect(result.url).toBe('https://example.com');
    expect(result.success).toBe(true);
    expect(result.html).toBeDefined();
  }, 30000);  // 增加超时时间，因为爬取可能需要时间

  afterAll(async () => {
    // 关闭爬虫池
    const pool = getCrawlerPool();
    await pool.close();
  });
});
