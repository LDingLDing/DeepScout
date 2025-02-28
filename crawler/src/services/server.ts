import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { Task } from '../models/task.model';
import { Crawler } from './crawler';

// 创建Express应用
const app = express();
const crawler = new Crawler();

/**
 * 启动API服务器
 */
export async function startServer(): Promise<void> {
  try {
    // 安全中间件
    app.use(helmet());
    
    // CORS配置
    app.use(cors());
    
    // 请求体解析
    app.use(express.json({ limit: '10mb' }));
    
    // 日志中间件
    app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
    
    // 健康检查端点
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date()
      });
    });
    
    // 手动爬取端点
    app.post('/crawl', async (req, res) => {
      try {
        const { task, url } = req.body;
        
        if (!task || !url) {
          return res.status(400).json({ error: '缺少必要参数' });
        }
        
        // 手动爬取指定URL
        const result = await crawler.crawl(task as Task, url);
        
        res.json(result);
      } catch (error) {
        logger.error('手动爬取失败:', error);
        res.status(500).json({ error: '爬取失败', message: error.message });
      }
    });
    
    // 启动服务器
    app.listen(config.server.port, config.server.host, () => {
      logger.info(`API服务器已启动: http://${config.server.host}:${config.server.port}`);
    });
  } catch (error) {
    logger.error('启动API服务器失败:', error);
    throw error;
  }
}

export default { startServer };
