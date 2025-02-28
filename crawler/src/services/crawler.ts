import { BrowserContext, Page } from 'playwright';
import { Task, CrawlResult } from '../models/task.model';
import { getCrawlerPool } from './crawlerPool';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export class Crawler {
  /**
   * 爬取单个目标
   * @param task 监控任务
   * @param targetUrl 目标URL
   */
  async crawl(task: Task, targetUrl: string): Promise<CrawlResult> {
    const crawlerPool = getCrawlerPool();
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    
    try {
      logger.info(`开始爬取任务 [${task.id}] URL: ${targetUrl}`);
      
      // 获取浏览器上下文
      context = await crawlerPool.createStealthContext();
      
      // 创建新标签页
      page = await context.newPage();
      
      // 设置超时
      page.setDefaultTimeout(config.crawler.defaultTimeout);
      
      // 添加请求拦截器，过滤掉不必要的资源，减轻服务器负担
      await page.route('**/*.{png,jpg,jpeg,gif,svg,pdf,zip,mp4,webp,css,font,woff,woff2,ttf,otf}', route => {
        route.abort();
      });
      
      // 导航到目标页面
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      
      // 等待页面加载
      await page.waitForTimeout(config.crawler.defaultWaitTime);
      
      // 获取HTML内容
      const html = await page.content();
      
      // 截图（如果启用）
      let screenshot: string | undefined;
      if (config.crawler.enableScreenshot) {
        const buffer = await page.screenshot({ fullPage: true });
        screenshot = buffer.toString('base64');
      }
      
      // 获取页面元数据
      const metadata = await this.extractMetadata(page);
      
      logger.info(`爬取任务 [${task.id}] URL: ${targetUrl} 完成`);
      
      return {
        taskId: task.id,
        url: targetUrl,
        timestamp: new Date(),
        success: true,
        html,
        screenshot,
        metadata
      };
    } catch (error) {
      logger.error(`爬取任务 [${task.id}] URL: ${targetUrl} 失败:`, error);
      
      return {
        taskId: task.id,
        url: targetUrl,
        timestamp: new Date(),
        success: false,
        error: error.message
      };
    } finally {
      // 关闭页面和上下文
      if (page) await page.close();
      if (context) await crawlerPool.releaseContext(context);
      
      // 添加随机延迟，避免请求过于频繁
      await new Promise(r => setTimeout(r, config.crawler.requestInterval));
    }
  }
  
  /**
   * 提取页面元数据
   * @param page 页面对象
   */
  private async extractMetadata(page: Page): Promise<Record<string, any>> {
    try {
      return await page.evaluate(() => {
        const metadata: Record<string, any> = {};
        
        // 提取标题
        metadata.title = document.title;
        
        // 提取元标签内容
        const metaTags = Array.from(document.querySelectorAll('meta'));
        metaTags.forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            metadata[name] = content;
          }
        });
        
        // 提取链接
        const links = Array.from(document.querySelectorAll('a'));
        metadata.links = links.map(link => ({
          text: link.textContent?.trim(),
          href: link.getAttribute('href')
        })).filter(link => link.href && link.text);
        
        return metadata;
      });
    } catch (error) {
      logger.error('提取页面元数据失败:', error);
      return {};
    }
  }
}

export default Crawler;
