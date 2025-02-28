// 系统配置
export const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env.CRAWLER_PORT || '3002', 10),
    host: process.env.CRAWLER_HOST || '0.0.0.0',
  },
  
  // API配置
  api: {
    backendUrl: process.env.API_URL || 'http://localhost:3001/api/v1',
  },
  
  // DeepSeek API配置
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
  },
  
  // 爬虫配置
  crawler: {
    // 浏览器实例池大小
    poolSize: parseInt(process.env.CRAWLER_POOL_SIZE || '5', 10),
    
    // 请求超时时间（毫秒）
    defaultTimeout: parseInt(process.env.CRAWLER_TIMEOUT || '30000', 10),
    
    // 页面加载等待时间（毫秒）
    defaultWaitTime: parseInt(process.env.CRAWLER_WAIT_TIME || '1000', 10),
    
    // 是否启用截图
    enableScreenshot: process.env.CRAWLER_ENABLE_SCREENSHOT === 'true',
    
    // 是否启用代理
    enableProxy: process.env.CRAWLER_ENABLE_PROXY === 'true',
    
    // 代理列表
    proxyList: process.env.CRAWLER_PROXY_LIST ? process.env.CRAWLER_PROXY_LIST.split(',') : [],
    
    // 两次请求之间的间隔时间（毫秒）
    requestInterval: parseInt(process.env.CRAWLER_REQUEST_INTERVAL || '2000', 10),
    
    // 是否启用用户代理轮换
    userAgentRotation: process.env.CRAWLER_UA_ROTATION === 'true',
  },
  
  // 调度器配置
  scheduler: {
    // 拉取任务的间隔时间（毫秒）
    pullInterval: parseInt(process.env.SCHEDULER_PULL_INTERVAL || '60000', 10),
    
    // 最大并发任务数
    concurrentTasks: parseInt(process.env.SCHEDULER_CONCURRENT_TASKS || '3', 10),
    
    // 最大重试次数
    maxRetries: parseInt(process.env.SCHEDULER_MAX_RETRIES || '3', 10)
  }
};

export default config;
