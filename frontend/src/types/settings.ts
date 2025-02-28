export interface ProxySettings {
  enabled: boolean;
  urls: string[];
  username?: string;
  password?: string;
}

export interface CrawlerSettings {
  poolSize: number;
  requestInterval: number;
  timeout: number;
  userAgentRotation: boolean;
  enableScreenshot: boolean;
}

export interface ApiSettings {
  apiKey: string;
  apiUrl: string;
  apiUsage: {
    used: number;
    limit: number;
    resetDate: string;
  };
}

export interface SystemSettings {
  proxy: ProxySettings;
  crawler: CrawlerSettings;
  api: ApiSettings;
  maxConcurrentTasks: number;
  notificationEmail?: string;
  enableEmailNotifications: boolean;
}

export interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  activeTasks: number;
  queuedTasks: number;
  crawlerStatus: 'running' | 'stopped' | 'error';
}
