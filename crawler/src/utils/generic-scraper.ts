import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ScraperOptions {
  url: string;
  outputDir?: string;
  timeout?: number;
  userAgent?: string;
  viewport?: { width: number; height: number };
  headless?: boolean;
  saveToFile?: boolean;
  fileName?: string;
  extraWaitTime?: number;
  requestIdleTime?: number;
}

/**
 * 通用网站爬虫
 * 可以爬取任何网站并返回完整 HTML
 */
export async function scrapeWebsite(options: ScraperOptions): Promise<string> {
  const {
    url,
    outputDir = path.join(__dirname, '../../output'),
    timeout = 60000,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport = { width: 1280, height: 800 },
    headless = true,
    saveToFile = true,
    fileName,
    extraWaitTime = 3000,
    requestIdleTime = 1000, // 请求空闲时间，默认1秒
  } = options;

  console.log(`开始爬取网站: ${url}`);
  
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  
  try {
    // 启动浏览器
    browser = await chromium.launch({
      headless,
      timeout: 30000,
    });
    
    // 创建浏览器上下文
    context = await browser.newContext({
      viewport,
      userAgent,
    });
    
    // 创建新页面
    const page = await context.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
      console.log(`页面控制台 [${msg.type()}]: ${msg.text()}`);
    });
    
    // 监听页面错误
    page.on('pageerror', error => {
      console.error(`页面错误: ${error.message}`);
    });
    
    // 设置请求监控
    let activeRequests = 0;
    let requestsFinished = false;
    let requestIdleTimer: NodeJS.Timeout | null = null;
    
    // 监听请求开始
    page.on('request', () => {
      activeRequests++;
      if (requestIdleTimer) {
        clearTimeout(requestIdleTimer);
        requestIdleTimer = null;
      }
    });
    
    // 监听请求结束
    page.on('requestfinished', () => {
      activeRequests--;
      checkRequestsIdle();
    });
    
    // 监听请求失败
    page.on('requestfailed', () => {
      activeRequests--;
      checkRequestsIdle();
    });
    
    // 检查请求是否空闲
    function checkRequestsIdle() {
      if (activeRequests === 0 && !requestsFinished) {
        if (requestIdleTimer) {
          clearTimeout(requestIdleTimer);
        }
        
        requestIdleTimer = setTimeout(() => {
          console.log(`所有网络请求已停止 ${requestIdleTime}ms，认为页面加载完成`);
          requestsFinished = true;
        }, requestIdleTime);
      }
    }
    
    // 访问目标网站
    console.log(`正在访问 ${url}...`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded', // 只等待 DOM 加载，不等待网络请求
      timeout,
    });
    
    console.log('等待页面基本内容加载...');
    await page.waitForSelector('body', { timeout });
    
    // 滚动页面以触发懒加载内容
    console.log('滚动页面以加载所有内容...');
    await autoScroll(page);
    
    // 等待所有请求完成
    console.log('等待所有网络请求完成...');
    const waitForRequestsPromise = new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (requestsFinished) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // 设置最大等待时间
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!requestsFinished) {
          console.warn(`等待网络请求完成超时，继续处理`);
        }
        resolve();
      }, timeout);
    });
    
    await waitForRequestsPromise;
    
    // 额外等待时间确保动态内容加载完成
    if (extraWaitTime > 0) {
      console.log(`额外等待 ${extraWaitTime}ms 确保内容加载完成...`);
      await page.waitForTimeout(extraWaitTime);
    }
    
    // 获取完整 HTML
    console.log('获取页面 HTML...');
    const html = await page.content();
    
    // 保存 HTML 到文件
    if (saveToFile) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/\./g, '_');
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const defaultFileName = `${domain}_${timestamp}.html`;
      
      const filePath = path.join(outputDir, fileName || defaultFileName);
      fs.writeFileSync(filePath, html);
      console.log(`HTML 已保存到: ${filePath}`);
    }
    
    return html;
  } catch (error) {
    console.error('爬取过程中发生错误:', error);
    throw error;
  } finally {
    // 关闭浏览器
    if (browser) {
      console.log('关闭浏览器...');
      await browser.close();
    }
  }
}

/**
 * 自动滚动页面到底部以触发懒加载内容
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight || totalHeight > 10000) { // 添加最大滚动限制
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * 使用示例
 */
if (require.main === module) {
  (async () => {
    try {
      const html = await scrapeWebsite({
        url: 'https://techcrunch.com/',
        requestIdleTime: 1000, // 1秒内没有新请求则认为加载完成
      });
      console.log(`成功获取 HTML，长度: ${html.length} 字符`);
    } catch (error) {
      console.error('程序执行失败:', error);
    }
  })();
}
