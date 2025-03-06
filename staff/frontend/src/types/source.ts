export enum SourceType {
  WEBSITE = 'website',
  RSS = 'rss',
  API = 'api',
  WECHAT = 'wechat',
  OTHER = 'other',
}

export enum SourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Source {
  id: number;
  name: string;
  type: SourceType;
  url?: string;
  description?: string;
  config?: Record<string, any>;
  status: SourceStatus;
  createdBy: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}
