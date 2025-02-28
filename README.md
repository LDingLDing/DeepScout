# DeepScout - 智能领域监控系统

DeepScout是一个基于AI增强的精准信息采集和结构化处理系统，帮助从业者用1/5时间完成领域动态监控�?
## 核心特点

- **基于DeepSeek R1的自然语言指令解析**
- **动态适配的智能爬虫引�?*
- **企业级数据安全合规方�?*

## 技术栈

- **前端**: Next.js + TypeScript
- **后端**: NestJS + TypeGraphQL
- **爬虫引擎**: Playwright + Browserless
- **AI服务**: DeepSeek R1 API
- **数据存储**: PostgreSQL (JSONB)
- **基础设施**: Docker + Docker Compose

## 快速开�?
### 环境要求

- Node.js 18+
- Docker 24.0+
- Docker Compose
- PostgreSQL 15

### 安装与运�?
```bash
# 克隆仓库
git clone https://github.com/your-org/deepscout.git
cd deepscout

# 安装依赖
pnpm install

# 启动开发环�?pnpm dev

# 启动Docker容器
docker-compose up -d
```

## 项目结构

```
deepscout/
├── frontend/           # Next.js前端应用
├── backend/            # NestJS后端服务
├── crawler/            # Playwright爬虫引擎
├── docker/             # Docker配置文件
├── docs/               # 文档
└── scripts/            # 辅助脚本
```

## 许可�?
[MIT](LICENSE)
