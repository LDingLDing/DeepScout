FROM mcr.microsoft.com/playwright:v1.37.0-focal

# 安装Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://fnm.vercel.app/install | bash
RUN /root/.local/share/fnm/fnm install 18
RUN echo 'eval "$(fnm env)"' >> /root/.bashrc

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

# 暴露端口
EXPOSE 3002

# 启动应用
CMD ["pnpm", "start"]
