import 'dotenv/config';
import { startServer } from './services/server';
import { initializeCrawlerPool } from './services/crawlerPool';
import { initializeScheduler } from './services/scheduler';
import { logger } from './utils/logger';

/**
 * 启动爬虫引擎
 */
async function startCrawler() {
  try {
    logger.info('启动爬虫引擎...');
    
    // 初始化爬虫池
    await initializeCrawlerPool();
    
    // 初始化任务调度器
    await initializeScheduler();
    
    // 启动API服务器
    await startServer();
    
    logger.info('爬虫引擎已成功启动');
  } catch (error) {
    logger.error('启动爬虫引擎失败:', error);
    process.exit(1);
  }
}

// 启动爬虫引擎
startCrawler();

// 处理进程退出
process.on('SIGINT', async () => {
  logger.info('收到退出信号，正在关闭爬虫引擎...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error('未处理的Promise拒绝:', reason);
});
