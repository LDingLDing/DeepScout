FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json文件
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# 生产环境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# 设置正确的权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 自动利用输出跟踪功能复制独立构建的输出文件
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
