# InfoRadar 部署指南

本文档详细介绍了 InfoRadar 项目的部署流程，包括本地开发环境和生产环境的部署步骤。

## 目录

- [环境要求](#环境要求)
- [本地开发环境部署](#本地开发环境部署)
  - [数据库配置](#数据库配置)
  - [环境变量配置](#环境变量配置)
  - [启动各个服务](#启动各个服务)
  - [初始化超级管理员账号](#初始化超级管理员账号)
- [Docker 部署](#docker-部署)
  - [Docker 环境准备](#docker-环境准备)
  - [使用 Docker Compose 部署](#使用-docker-compose-部署)
- [生产环境部署](#生产环境部署)
  - [服务器环境准备](#服务器环境准备)
  - [项目部署](#项目部署)
  - [Nginx 配置](#nginx-配置)
  - [SSL 证书配置](#ssl-证书配置)
- [部署后验证](#部署后验证)
- [常见问题与解决方案](#常见问题与解决方案)

## 环境要求

- Node.js v18 或更高版本
- PostgreSQL 15 或更高版本
- pnpm 8.0 或更高版本
- Docker 和 Docker Compose (可选，用于容器化部署)

## 本地开发环境部署

### 数据库配置

#### Windows 环境

1. 下载并安装 PostgreSQL：
   - 访问 [PostgreSQL 官网](https://www.postgresql.org/download/windows/) 下载安装包
   - 运行安装程序，按照向导完成安装
   - 设置管理员密码（记住这个密码，它将用于环境变量配置）

2. 创建数据库：
   - 使用 pgAdmin（PostgreSQL 安装时会自动安装）
   - 打开 pgAdmin，连接到服务器
   - 右键点击 "Databases"，选择 "Create" > "Database"
   - 输入数据库名称 `inforadar`，点击保存

#### Linux/macOS 环境

1. 安装 PostgreSQL：

   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # macOS (使用 Homebrew)
   brew install postgresql
   ```

2. 启动 PostgreSQL 服务：

   ```bash
   # Ubuntu/Debian
   sudo systemctl start postgresql
   sudo systemctl enable postgresql

   # macOS
   brew services start postgresql
   ```

3. 创建数据库：

   ```bash
   sudo -u postgres psql
   CREATE DATABASE inforadar;
   \q
   ```

### 环境变量配置

1. 在项目根目录创建 `.env` 文件（可以复制 `.env.example` 并修改）：

   ```bash
   cp .env.example .env
   ```

2. 根据实际情况修改 `.env` 文件中的配置：

   ```
   # 数据库配置
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=你的数据库密码
   DB_DATABASE=inforadar

   # DeepSeek API配置
   DEEPSEEK_API_KEY=your_deepseek_api_key

   # 管理员账号配置
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ADMIN_EMAIL=admin@example.com

   # JWT配置
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d

   # 服务端口
   CLIENT_FRONTEND_PORT=3000
   CLIENT_BACKEND_PORT=3001
   STAFF_FRONTEND_PORT=3002
   STAFF_BACKEND_PORT=3003
   CRAWLER_PORT=3004

   # API URL
   CLIENT_API_URL=http://localhost:3001/api/v1
   STAFF_API_URL=http://localhost:3003/api/v1

   # 运行环境
   NODE_ENV=development
   ```

### 启动各个服务

1. 安装依赖：

   ```bash
   pnpm install
   ```

2. 启动客户端后端：

   ```bash
   cd client/backend
   pnpm run dev
   ```

3. 启动客户端前端：

   ```bash
   cd client/frontend
   pnpm run dev
   ```

4. 启动管理后台后端：

   ```bash
   cd staff/backend
   pnpm run dev
   ```

5. 启动管理后台前端：

   ```bash
   cd staff/frontend
   pnpm run dev
   ```

6. 启动采集服务（可选）：

   ```bash
   cd crawler
   pnpm run dev
   ```

### 初始化超级管理员账号

运行以下命令创建超级管理员账号：

```bash
cd staff/backend
pnpm run seed
```

这将使用 `.env` 文件中配置的管理员信息创建一个超级管理员账号。

## Docker 部署

### Docker 环境准备

1. 安装 Docker 和 Docker Compose：
   - [Docker 安装指南](https://docs.docker.com/get-docker/)
   - [Docker Compose 安装指南](https://docs.docker.com/compose/install/)

2. 确保 Docker 服务已启动：

   ```bash
   # Linux
   sudo systemctl start docker
   sudo systemctl enable docker

   # Windows/macOS
   # Docker Desktop 应用程序会自动启动 Docker 服务
   ```

### 使用 Docker Compose 部署

1. 在项目根目录创建 `.env` 文件（如果尚未创建）：

   ```bash
   cp .env.example .env
   ```

2. 修改 `.env` 文件中的配置，特别是 `DEEPSEEK_API_KEY`。

3. 构建并启动所有服务：

   ```bash
   docker-compose up -d
   ```

4. 初始化超级管理员账号：

   ```bash
   docker-compose exec staff-backend pnpm run seed
   ```

5. 访问各个服务：
   - 客户端前端：http://localhost:3000
   - 客户端后端：http://localhost:3001
   - 管理后台前端：http://localhost:3002
   - 管理后台后端：http://localhost:3003

## 生产环境部署

### 服务器环境准备

1. 准备一台 Linux 服务器（推荐 Ubuntu 20.04 LTS 或更高版本）

2. 安装必要的软件：

   ```bash
   sudo apt update
   sudo apt install -y curl git nginx
   ```

3. 安装 Node.js：

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. 安装 pnpm：

   ```bash
   sudo npm install -g pnpm
   ```

5. 安装 Docker 和 Docker Compose（如果使用容器化部署）：

   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com | sudo bash
   sudo usermod -aG docker $USER

   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

### 项目部署

#### 方法一：使用 Docker Compose（推荐）

1. 克隆项目代码：

   ```bash
   git clone https://github.com/your-username/DeepScout.git
   cd DeepScout
   ```

2. 创建并配置 `.env` 文件：

   ```bash
   cp .env.example .env
   # 编辑 .env 文件，设置生产环境的配置
   nano .env
   ```

3. 修改 `.env` 文件，将 `NODE_ENV` 设置为 `production`，并设置其他必要的环境变量。

4. 构建并启动所有服务：

   ```bash
   docker-compose up -d
   ```

5. 初始化超级管理员账号：

   ```bash
   docker-compose exec staff-backend pnpm run seed
   ```

#### 方法二：手动部署

1. 克隆项目代码：

   ```bash
   git clone https://github.com/your-username/DeepScout.git
   cd DeepScout
   ```

2. 安装依赖：

   ```bash
   pnpm install
   ```

3. 创建并配置 `.env` 文件：

   ```bash
   cp .env.example .env
   # 编辑 .env 文件，设置生产环境的配置
   nano .env
   ```

4. 构建各个服务：

   ```bash
   # 构建客户端前端
   cd client/frontend
   pnpm run build

   # 构建客户端后端
   cd ../../client/backend
   pnpm run build

   # 构建管理后台前端
   cd ../../staff/frontend
   pnpm run build

   # 构建管理后台后端
   cd ../../staff/backend
   pnpm run build

   # 构建采集服务
   cd ../../crawler
   pnpm run build
   ```

5. 使用 PM2 启动各个服务：

   ```bash
   # 安装 PM2
   sudo npm install -g pm2

   # 启动客户端后端
   cd client/backend
   pm2 start dist/main.js --name client-backend

   # 启动客户端前端
   cd ../../client/frontend
   pm2 start node_modules/next/dist/bin/next --name client-frontend -- start -p 3000

   # 启动管理后台后端
   cd ../../staff/backend
   pm2 start dist/main.js --name staff-backend

   # 启动管理后台前端
   cd ../../staff/frontend
   pm2 start node_modules/next/dist/bin/next --name staff-frontend -- start -p 3002

   # 启动采集服务
   cd ../../crawler
   pm2 start dist/main.js --name crawler

   # 保存 PM2 配置
   pm2 save

   # 设置开机自启
   pm2 startup
   ```

6. 初始化超级管理员账号：

   ```bash
   cd staff/backend
   pnpm run seed
   ```

### Nginx 配置

1. 创建 Nginx 配置文件：

   ```bash
   sudo nano /etc/nginx/sites-available/inforadar
   ```

2. 添加以下配置：

   ```nginx
   # 客户端前端
   server {
       listen 80;
       server_name client.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # 客户端后端
   server {
       listen 80;
       server_name api.client.yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # 管理后台前端
   server {
       listen 80;
       server_name staff.yourdomain.com;

       location / {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # 管理后台后端
   server {
       listen 80;
       server_name api.staff.yourdomain.com;

       location / {
           proxy_pass http://localhost:3003;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. 启用配置并重启 Nginx：

   ```bash
   sudo ln -s /etc/nginx/sites-available/inforadar /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### SSL 证书配置

使用 Let's Encrypt 获取免费的 SSL 证书：

1. 安装 Certbot：

   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. 获取并配置证书：

   ```bash
   sudo certbot --nginx -d client.yourdomain.com -d api.client.yourdomain.com -d staff.yourdomain.com -d api.staff.yourdomain.com
   ```

3. 设置自动续期：

   ```bash
   sudo systemctl status certbot.timer
   ```

## 部署后验证

1. 检查各个服务是否正常运行：

   ```bash
   # 如果使用 Docker Compose
   docker-compose ps

   # 如果使用 PM2
   pm2 status
   ```

2. 访问各个服务的 URL 确认是否可以正常访问：
   - 客户端前端：https://client.yourdomain.com
   - 客户端 API：https://api.client.yourdomain.com
   - 管理后台前端：https://staff.yourdomain.com
   - 管理后台 API：https://api.staff.yourdomain.com

3. 使用超级管理员账号登录管理后台，确认功能正常。

## 常见问题与解决方案

### 数据库连接问题

**问题**：无法连接到 PostgreSQL 数据库

**解决方案**：
1. 确认 PostgreSQL 服务正在运行
2. 检查数据库连接配置（主机、端口、用户名、密码）
3. 确认数据库用户有足够的权限
4. 检查防火墙设置是否允许数据库连接

### Docker 容器无法启动

**问题**：Docker 容器启动失败

**解决方案**：
1. 检查 Docker 日志：`docker-compose logs <service-name>`
2. 确认 `.env` 文件配置正确
3. 确认 Docker 和 Docker Compose 版本是否兼容
4. 尝试重新构建容器：`docker-compose up -d --build`

### 前端无法连接后端 API

**问题**：前端应用无法连接到后端 API

**解决方案**：
1. 确认后端服务正在运行
2. 检查 API URL 配置是否正确
3. 检查 CORS 设置是否正确
4. 检查网络连接和防火墙设置

### 超级管理员账号创建失败

**问题**：无法创建超级管理员账号

**解决方案**：
1. 确认数据库连接正常
2. 检查 `.env` 文件中的管理员配置
3. 查看 seed 脚本的日志输出
4. 手动检查数据库中是否已存在管理员账号
