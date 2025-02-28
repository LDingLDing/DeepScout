FROM node:18-alpine AS base

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json ./

# 安装依赖
RUN pnpm install

# 复制所有文件
COPY . .

# 构建应用
RUN pnpm build

# 生产环境
FROM node:18-alpine AS production

WORKDIR /app

# 复制构建产物和依赖
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
