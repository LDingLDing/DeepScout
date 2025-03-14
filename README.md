# InfoRadar 信息雷达

## 产品概述

InfoRadar 是一款基于 AI 增强的信息雷达，通过精准信息采集和结构化处理，帮助从业者用 1/5 的时间完成领域动态监控。系统支持多种数据源的自动化采集、智能分析和结构化处理，为用户提供实时、准确的领域动态信息。

### 核心价值

- **高效监控**：自动化采集和处理，大幅减少人工筛选时间
- **精准分析**：基于 AI 的内容理解，提取关键信息并进行结构化处理
- **灵活配置**：支持自定义监控目标、提取规则和调度策略
- **多端支持**：同时支持 PC 端和移动端，随时随地掌握领域动态

## 快速开始

### 环境要求

- Node.js 18+
- Docker 24.0+
- Docker Compose
- PostgreSQL 15
- Python 3.x (用于编译原生模块)
- C++ 编译工具链 (用于编译原生模块)

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

#### 使用说明

1. **环境准备**
   - 确保已安装Node.js 18+和PostgreSQL 15
   - 使用pnpm作为包管理器：`npm install -g pnpm`

2. **安装依赖**
   ```bash
   cd staff/frontend
   pnpm install
   
   cd ../backend
   pnpm install
   ```

3. **配置环境变量**
   - 复制`.env.example`到`.env`并根据实际情况修改配置
   - 主要配置项包括数据库连接信息、JWT密钥、管理员账号等

4. **启动服务**
   ```bash
   # 启动后端服务
   cd staff/backend
   pnpm dev
   
   # 启动前端服务
   cd staff/frontend
   pnpm dev
   ```

5. **访问系统**
   - 前端访问地址：`http://localhost:3002/staff`
   - 后端API地址：`http://localhost:3003/api/v1`
   - GraphQL地址：`http://localhost:3003/graphql`

6. **初始账号**
   - 默认管理员账号：在`.env`文件中配置的ADMIN_USERNAME和ADMIN_PASSWORD
   - 首次使用需要运行初始化脚本：`cd staff/backend && pnpm seed`

7. **常见问题解决**
   - 如遇到GraphQL Schema错误，确保至少定义了一个查询类型
   - 数据库连接问题，检查`.env`文件中的数据库配置是否正确
   - 更多详细信息请参考`docs/部署指南.md`

## isolated-vm 原生模块说明

本项目的采集服务 (crawler) 使用了 isolated-vm 库来提供安全的沙箱环境。由于 isolated-vm 是一个原生模块，需要在不同环境下进行编译，以下是相关说明：

### Windows 环境

在 Windows 环境下，isolated-vm 可能需要手动编译：

1. **安装必要的构建工具**：
   ```bash
   # 安装 node-gyp
   npm install -g node-gyp

   # 安装 Visual Studio Build Tools (推荐)
   # 下载并安装：https://visualstudio.microsoft.com/visual-cpp-build-tools/
   # 安装时选择"C++ 构建工具"工作负载
   ```

2. **手动编译 isolated-vm**：
   ```bash
   # 进入 isolated-vm 模块目录
   cd node_modules/isolated-vm
   
   # 重新构建
   node-gyp rebuild
   
   # 返回项目根目录
   cd ../..
   ```

### Linux 环境

在 Linux 环境下，确保安装了必要的构建工具：

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y python3 make g++ build-essential

# CentOS/RHEL
sudo yum install -y python3 make gcc-c++ kernel-devel

# 安装后重新安装 isolated-vm
pnpm remove isolated-vm
pnpm add isolated-vm
```

### macOS 环境

在 macOS 环境下，确保安装了 Xcode 命令行工具：

```bash
# 安装 Xcode 命令行工具
xcode-select --install

# 安装后重新安装 isolated-vm
pnpm remove isolated-vm
pnpm add isolated-vm
```

### Docker 环境

在 Docker 环境中，确保 Dockerfile 包含必要的构建工具：

```dockerfile
# 在 Dockerfile 中添加
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential
```

### 故障排除

如果遇到 isolated-vm 编译问题：

1. **清除缓存并重新安装**：
   ```bash
   pnpm cache clean
   pnpm remove isolated-vm
   pnpm add isolated-vm
   ```

2. **指定 Python 路径**：
   ```bash
   # Windows
   set npm_config_python=C:\Path\To\Your\Python\python.exe
   
   # Linux/macOS
   export npm_config_python=/path/to/your/python3
   
   pnpm remove isolated-vm
   pnpm add isolated-vm
   ```

3. **使用预编译二进制版本**：
   ```bash
   # Windows
   set npm_config_isolated_vm_binary=true
   
   # Linux/macOS
   export npm_config_isolated_vm_binary=true
   
   pnpm remove isolated-vm
   pnpm add isolated-vm
   ```

## 贡献指南

我们欢迎各种形式的贡献，包括但不限于：功能开发、bug修复、文档改进、测试用例编写等。

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证




