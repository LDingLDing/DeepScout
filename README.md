# InfoRadar - 智能信息雷达

InfoRadar是一款基于AI增强的智能信息监控系统，通过精准信息采集和结构化处理，帮助用户用1/5的时间完成领域动态监控。系统支持多种数据源的自动化采集、智能分析和结构化处理，为用户提供实时、准确的领域动态信息。

## 核心功能

- **智能信息采集**：支持网页、API、RSS等多种数据源的自动化采集
- **AI内容理解**：基于大语言模型的内容理解与结构化处理
- **自定义监控规则**：灵活配置监控目标、提取规则和调度策略
- **数据可视化**：直观展示监控结果和趋势分析
- **多端支持**：同时支持PC端和移动端，随时随地掌握领域动态

## 技术架构

### 前端技术栈

- **框架**：React + Next.js
- **UI组件**：Ant Design
- **状态管理**：React Query
- **HTTP客户端**：Axios
- **类型系统**：TypeScript

### 后端技术栈

- **服务框架**：NestJS + TypeGraphQL
- **数据库**：PostgreSQL
- **ORM**：TypeORM
- **API**：GraphQL + REST
- **认证授权**：JWT

### 爬虫引擎

- **核心引擎**：Playwright
- **无头浏览器**：Browserless
- **任务调度**：node-cron
- **日志系统**：Winston

### 基础设施

- **容器化**：Docker + Docker Compose
- **开发工具**：PNPM Workspace
- **CI/CD**：GitHub Actions

## 项目结构

```
inforadar/
├── frontend/           # Next.js前端应用
│   ├── src/            # 源代码
│   │   ├── components/ # UI组件
│   │   ├── pages/      # 页面路由
│   │   ├── hooks/      # 自定义Hooks
│   │   ├── services/   # API服务
│   │   └── utils/      # 工具函数
│   └── public/         # 静态资源
│
├── backend/            # NestJS后端服务
│   ├── src/            # 源代码
│   │   ├── modules/    # 业务模块
│   │   ├── entities/   # 数据实体
│   │   ├── services/   # 服务层
│   │   ├── resolvers/  # GraphQL解析器
│   │   └── utils/      # 工具函数
│   └── test/           # 测试
│
├── crawler/            # Playwright爬虫引擎
│   ├── src/            # 源代码
│   │   ├── engines/    # 爬虫引擎
│   │   ├── services/   # 服务层
│   │   ├── models/     # 数据模型
│   │   └── utils/      # 工具函数
│   └── test/           # 测试
│
├── docker/             # Docker配置文件
├── docs/               # 文档
└── scripts/            # 辅助脚本
```

## 快速开始

### 环境要求

- Node.js 18+
- Docker 24.0+
- Docker Compose
- PostgreSQL 15

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/your-org/inforadar.git
cd inforadar

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置必要的环境变量

# 开发模式启动
pnpm dev

# 或使用Docker启动所有服务
docker-compose up -d
```

## 主要功能模块

### 1. 仪表盘

- 系统运行状态和数据概览
- 活跃监控任务数量
- 今日采集数据条数
- API调用余额
- 快速创建任务入口

### 2. 监控任务管理

- 任务创建：设置任务名称、描述、监控目标、提取规则和调度策略
- 任务列表：查看所有任务及其状态，支持搜索和筛选
- 任务详情：查看任务详细信息、监控目标和执行结果
- 任务操作：运行、暂停、编辑和删除任务

### 3. 系统设置

- 系统状态：CPU、内存、磁盘使用率，爬虫状态，运行时间等
- 爬虫设置：浏览器实例池大小、请求间隔、超时时间等
- 代理设置：配置代理服务器，提高采集成功率
- API设置：配置AI API密钥和URL
- 通知设置：配置邮件通知，及时获取任务执行结果

## 贡献指南

我们欢迎各种形式的贡献，包括但不限于：功能开发、bug修复、文档改进、测试用例编写等。

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

[MIT](LICENSE)

## 联系我们

- 项目主页：[https://github.com/your-org/inforadar](https://github.com/your-org/inforadar)
- 问题反馈：[https://github.com/your-org/inforadar/issues](https://github.com/your-org/inforadar/issues)

---

 2025 InfoRadar | 版本：1.0.0
