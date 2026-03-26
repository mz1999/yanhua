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
