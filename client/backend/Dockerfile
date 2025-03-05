FROM node:18-alpine AS base

# u5b89u88c5u4f9du8d56
FROM base AS deps
WORKDIR /app

# u5b89u88c5pnpm
RUN npm install -g pnpm

# u590du5236package.jsonu6587u4ef6
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# u6784u5efau5e94u7528
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# u751fu4ea7u73afu5883
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
