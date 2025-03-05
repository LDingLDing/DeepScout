FROM node:18-alpine AS base

# u5b89u88c5u4f9du8d56
FROM base AS deps
RUN apk add --no-cache libc6-compat
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

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# u8bbeu7f6eu6b63u786eu7684u6743u9650
RUN mkdir .next
RUN chown nextjs:nodejs .next

# u81eau52a8u5229u7528u8f93u51fau8ddfu8e2au529fu80fdu590du5236u72ecu7acbu6784u5efau7684u8f93u51fau6587u4ef6
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
