import { chromium, Browser, BrowserContext } from 'playwright';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { generateRandomUA } from '../utils/userAgents';

// 浏览器实例池
interface BrowserInstance {
  browser: Browser;
  contexts: BrowserContext[];
  lastUsed: Date;
}

// 代理配置
interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

class CrawlerPool {
  private pool: BrowserInstance[] = [];
  private proxyIndex = 0;

  /**
   * 初始化爬虫池
   */
  async initialize(): Promise<void> {
    try {
      logger.info(`正在初始化爬虫池，大小: ${config.crawler.poolSize}`);
      
      for (let i = 0; i < config.crawler.poolSize; i++) {
        const browser = await chromium.launch({
          headless: true,
        });
        
        this.pool.push({
          browser,
          contexts: [],
          lastUsed: new Date()
        });
        
        logger.info(`浏览器实例 #${i+1} 初始化成功`);
      }
      
      logger.info('爬虫池初始化完成');
    } catch (error) {
      logger.error('爬虫池初始化失败:', error);
      throw new Error('爬虫池初始化失败');
    }
  }

  /**
   * 创建隐身浏览器上下文
   */
  async createStealthContext(): Promise<BrowserContext> {
    try {
      // 选择最少使用的浏览器实例
      const instance = this.getLeastUsedInstance();
      
      // 获取代理配置（如果启用）
      const proxy = config.crawler.enableProxy ? this.getNextProxy() : undefined;
      
      // 创建上下文
      const context = await instance.browser.newContext({
        userAgent: config.crawler.userAgentRotation ? generateRandomUA() : undefined,
        viewport: { width: 1920, height: 1080 },
        proxy,
      });
      
      // 添加反检测脚本
      await this.addEvasionScripts(context);
      
      // 更新实例状态
      instance.contexts.push(context);
      instance.lastUsed = new Date();
      
      return context;
    } catch (error) {
      logger.error('创建隐身浏览器上下文失败:', error);
      throw error;
    }
  }

  /**
   * 添加反检测脚本
   */
  private async addEvasionScripts(context: BrowserContext): Promise<void> {
    // 注入反检测脚本
    await context.addInitScript(() => {
      // 覆盖WebGL指纹
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // 伪装GPU厂商
        if (parameter === 37445) return 'Intel Inc.';
        return getParameter.apply(this, [parameter]);
      };
      
      // 隐藏自动化特征
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // 伪装插件
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' },
        ],
      });
    });
  }

  /**
   * 释放浏览器上下文
   */
  async releaseContext(context: BrowserContext): Promise<void> {
    try {
      // 查找包含该上下文的实例
      for (const instance of this.pool) {
        const contextIndex = instance.contexts.indexOf(context);
        if (contextIndex !== -1) {
          // 关闭上下文
          await context.close();
          // 从实例中移除
          instance.contexts.splice(contextIndex, 1);
          return;
        }
      }
    } catch (error) {
      logger.error('释放浏览器上下文失败:', error);
    }
  }

  /**
   * 获取最少使用的浏览器实例
   */
  private getLeastUsedInstance(): BrowserInstance {
    // 按上下文数量和最后使用时间排序
    this.pool.sort((a, b) => {
      if (a.contexts.length !== b.contexts.length) {
        return a.contexts.length - b.contexts.length;
      }
      return a.lastUsed.getTime() - b.lastUsed.getTime();
    });
    
    return this.pool[0];
  }

  /**
   * 获取下一个代理配置
   */
  private getNextProxy(): ProxyConfig | undefined {
    if (!config.crawler.proxyList || config.crawler.proxyList.length === 0) {
      return undefined;
    }
    
    // 轮询代理列表
    const proxy = config.crawler.proxyList[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % config.crawler.proxyList.length;
    
    return { server: proxy };
  }

  /**
   * 关闭所有浏览器实例
   */
  async close(): Promise<void> {
    try {
      logger.info('正在关闭爬虫池...');
      
      for (const instance of this.pool) {
        for (const context of instance.contexts) {
          await context.close();
        }
        await instance.browser.close();
      }
      
      this.pool = [];
      logger.info('爬虫池已关闭');
    } catch (error) {
      logger.error('关闭爬虫池失败:', error);
    }
  }
}

// 全局爬虫池实例
const crawlerPool = new CrawlerPool();

/**
 * 初始化爬虫池
 */
export async function initializeCrawlerPool(): Promise<void> {
  await crawlerPool.initialize();
}

/**
 * 获取爬虫池实例
 */
export function getCrawlerPool(): CrawlerPool {
  return crawlerPool;
}

export default { initializeCrawlerPool, getCrawlerPool };
