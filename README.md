# 言画

用文字配置创作独特的治愈系空间图片。

## 功能特点

- **8 维度配置体系**：核心情绪、建筑风格、地域、空间功能、天气、光影质感、绘画风格、构图重点
- **AI 智能生成**：自动生成专业绘画提示词，一键生成 4 张候选图
- **一键发布**：选中图片后自动生成小红书风格文案

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd yanhua
npm install
```

### 2. 配置环境变量

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env 文件，填入你的 API Keys
nano .env
```

需要配置：

| 配置项 | 说明 | 获取方式 |
|--------|------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek/SiliconFlow API 密钥 | [platform.deepseek.com](https://platform.deepseek.com/) 或 [siliconflow.cn](https://siliconflow.cn/) |
| `JIMENG_API_KEY` | 即梦 session ID | 本地部署 [jimeng-free-api-all](https://github.com/zhizinan1997/jimeng-free-api-all) |

可选配置：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `LLM_API_URL` | 提示词生成 API 端点 | `https://api.siliconflow.cn/v1/chat/completions` |
| `LLM_MODEL` | 使用的模型名称 | `deepseek-ai/DeepSeek-V3.2` |

详细配置步骤请参考应用内的「设置」页面。

### 3. 初始化数据库

```bash
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## Docker 部署

### 前置要求

- 已安装 Docker 和 Docker Compose
- 即梦服务（jimeng-free-api-all）已部署并运行在 `http://宿主机IP:8000`

### 部署步骤

#### 1. 构建镜像

```bash
# 克隆项目
git clone <repository-url>
cd yanhua

# 构建 Docker 镜像
docker build -t yanhua-app:latest .
```

#### 2. 配置环境变量

```bash
# 复制示例配置文件
cp .env.docker.example .env

# 编辑 .env 文件，填写以下必需项
nano .env
```

必需配置：

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek/SiliconFlow API 密钥 | `sk-xxx...` |
| `JIMENG_API_KEY` | 即梦 session ID | 在即梦服务页面获取 |
| `JIMENG_API_URL` | 即梦服务地址 | `http://172.17.0.1:8000` |

获取宿主机 IP：
```bash
ip addr show docker0 | grep inet
# 示例输出：inet 172.17.0.1/16 brd 172.17.255.255
# 则 JIMENG_API_URL=http://172.17.0.1:8000
```

#### 3. 启动服务

```bash
# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问 http://localhost:3000

### 常用命令

```bash
# 查看容器状态
docker-compose ps

# 重启服务
docker-compose restart

# 进入容器调试
docker exec -it yanhua-app sh
```

## 技术栈

- **框架**: Next.js 14 + React + TypeScript
- **样式**: Tailwind CSS
- **数据库**: SQLite + Prisma
- **AI 服务**: DeepSeek + 即梦

## 项目结构

```
├── prisma/              # 数据库 schema
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API 路由
│   │   ├── create/     # 创建任务页面
│   │   ├── settings/   # 配置指南页面
│   │   └── task/[id]/  # 任务详情页
│   ├── components/     # UI 组件
│   └── lib/            # 工具函数和配置
└── .env.example        # 环境变量示例
```

## License

MIT
