FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 文件并安装依赖
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 生产环境阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
