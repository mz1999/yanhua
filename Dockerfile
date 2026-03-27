# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装所有依赖（包括 devDependencies 用于构建）
RUN npm ci --registry https://registry.npmmirror.com/

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN ./node_modules/.bin/prisma generate

# 构建 Next.js 应用
RUN npm run build

# 生产阶段 - 使用更小的基础镜像
FROM node:20-alpine

WORKDIR /app

# 复制必要文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# 复制 prisma 相关文件
COPY --from=builder /app/prisma ./prisma

# 创建数据目录
RUN mkdir -p /app/data

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/app/data/dev.db

# 持久化数据卷
VOLUME ["/app/data"]

EXPOSE 3000

# 启动时先执行数据库迁移，然后启动应用
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node server.js"]
