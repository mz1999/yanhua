# 言画视频创作自动化系统 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Next.js 全栈应用，自动化视频创作流程：结构化输入 → 提示词扩展 → 文生图 → 图生视频 → 配乐合并 → 发布辅助

**Architecture:** 纯 Next.js 全栈架构，使用 App Router、TypeScript、Tailwind CSS + shadcn/ui、Prisma + SQLite、本地文件存储

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui, Prisma, SQLite, FFmpeg

---

## 文件结构映射

```
yanhua/
├── .env.local                    # 环境变量
├── .env.example                  # 环境变量示例
├── next.config.js               # Next.js 配置
├── tailwind.config.ts           # Tailwind 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 依赖管理
├── prisma/
│   └── schema.prisma            # 数据库模型
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # 首页/仪表盘
│   │   ├── layout.tsx           # 根布局
│   │   ├── globals.css          # 全局样式
│   │   ├── create/
│   │   │   └── page.tsx         # 创建任务页
│   │   ├── task/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # 任务详情页
│   │   ├── templates/
│   │   │   └── page.tsx         # 模板管理页
│   │   └── settings/
│   │       └── page.tsx         # 设置页
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 组件
│   │   ├── forms/               # 表单组件
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── StyleSelector.tsx
│   │   │   ├── RegionSelector.tsx
│   │   │   └── PromptEditor.tsx
│   │   └── workflow/            # 工作流组件
│   │       ├── StepIndicator.tsx
│   │       ├── ImageGallery.tsx
│   │       ├── VideoPlayer.tsx
│   │       └── PublishPreview.tsx
│   ├── lib/
│   │   ├── db.ts                # Prisma 客户端
│   │   ├── config.ts            # 应用配置
│   │   ├── types.ts             # TypeScript 类型定义
│   │   ├── errors.ts            # 错误类型定义
│   │   ├── utils.ts             # 工具函数
│   │   ├── templates/           # 模板定义
│   │   │   ├── index.ts
│   │   │   └── cozy-home.ts
│   │   └── services/            # 业务服务
│   │       ├── prompt-expander.ts
│   │       ├── jimeng-client.ts
│   │       ├── video-processor.ts
│   │       ├── publish-helper.ts
│   │       └── task-manager.ts
│   └── app/api/                 # API 路由
│       ├── tasks/
│       │   └── route.ts         # 任务 CRUD
│       ├── tasks/[id]/
│       │   ├── route.ts         # 单个任务操作
│       │   ├── generate-prompt/
│       │   │   └── route.ts     # 生成提示词
│       │   ├── generate-image/
│       │   │   └── route.ts     # 文生图
│       │   ├── generate-video/
│       │   │   └── route.ts     # 图生视频
│       │   ├── merge-audio/
│       │   │   └── route.ts     # 合并配乐
│       │   └── generate-publish/
│       │       └── route.ts     # 生成发布内容
│       └── templates/
│           └── route.ts         # 模板 API
└── public/
    └── uploads/                 # 文件上传目录
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `next.config.js`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: 初始化 package.json**

```json
{
  "name": "yanhua",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.10.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.344.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/uuid": "^9.0.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "prisma": "^5.10.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

Run: `npm install`
Expected: 依赖安装成功，出现 node_modules 目录

- [ ] **Step 3: 创建 TypeScript 配置**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 创建 Tailwind 配置**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: 创建 Next.js 配置**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 6: 创建环境变量示例**

```bash
# 必需
DEEPSEEK_API_KEY=your_siliconflow_api_key_here

# 可选（有默认值）
FFMPEG_PATH=ffmpeg
JIMENG_API_URL=http://localhost:3000/v1
DATABASE_URL=file:./yanhua.db
```

- [ ] **Step 7: 更新 .gitignore**

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# database
*.db
*.db-journal

# uploads
/public/uploads/*
!/public/uploads/.gitkeep
```

- [ ] **Step 8: 创建必要的目录结构**

Run:
```bash
mkdir -p src/app/create src/app/task/\[id\] src/app/templates src/app/settings
mkdir -p src/components/ui src/components/forms src/components/workflow
mkdir -p src/lib/templates src/lib/services
mkdir -p src/app/api/tasks/\[id\]/{generate-prompt,generate-image,generate-video,merge-audio,generate-publish}
mkdir -p src/app/api/templates
mkdir -p prisma
mkdir -p public/uploads
touch public/uploads/.gitkeep
```

- [ ] **Step 9: 创建 postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 10: 首次提交**

Run:
```bash
git init
git add .
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: 数据库模型与 Prisma 配置

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Modify: `.env.local`

- [ ] **Step 1: 创建 Prisma Schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Task {
  id              String   @id @default(uuid())
  status          String   // TaskStatus
  mode            String   // 'auto' | 'step'

  // 输入
  templateId      String?
  style           String?
  scene           String?
  composition     String?
  lighting        String?
  era             String?
  region          String?
  culture         String?
  description     String?

  // 输出
  prompt          String?
  images          String?  // JSON 数组
  selectedImage   String?
  videoUrl        String?
  finalVideoPath  String?
  bgmPath         String?

  // 发布内容
  title           String?
  content         String?
  tags            String?  // JSON 数组

  // 元数据
  errorMessage    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Template {
  id             String   @id @default(uuid())
  name           String
  category       String
  description    String?
  defaults       String   // JSON
  promptTemplate String
  isBuiltin      Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

- [ ] **Step 2: 创建 Prisma 客户端**

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: 初始化数据库**

Run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
Expected: 创建 yanhua.db 文件，生成 Prisma 客户端

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add Prisma schema and database setup"
```

---

## Task 3: 类型定义与工具函数

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/utils.ts`
- Create: `src/lib/errors.ts`
- Create: `src/lib/config.ts`

- [ ] **Step 1: 创建类型定义**

```typescript
// src/lib/types.ts

export type TaskMode = 'auto' | 'step';

export type TaskStatus =
  | 'pending'
  | 'prompt_generating'
  | 'prompt_generated'
  | 'image_generating'
  | 'image_generated'
  | 'video_generating'
  | 'video_generated'
  | 'merging'
  | 'completed'
  | 'error';

export interface StructuredInput {
  templateId?: string;
  style?: string;
  scene?: string;
  composition?: string;
  lighting?: string;
  era?: string;
  region?: string;
  culture?: string;
  description?: string;
}

export interface PublishContent {
  title: string;
  content: string;
  tags: string[];
}

export interface TemplateData {
  id: string;
  name: string;
  category: string;
  description?: string;
  defaults: {
    style: string;
    scene: string;
    composition: string;
    lighting: string;
    era: string;
    region: string;
    culture: string[];
  };
  promptTemplate: string;
}

export interface TaskResponse {
  id: string;
  status: TaskStatus;
  mode: TaskMode;
  userInput: StructuredInput;
  prompt?: string;
  images?: string[];
  selectedImage?: string;
  videoUrl?: string;
  finalVideoPath?: string;
  bgmPath?: string;
  publishContent?: PublishContent;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: 创建工具函数**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delayMs = initialDelay * Math.pow(2, i);
        await delay(delayMs);
      }
    }
  }

  throw lastError!;
}
```

- [ ] **Step 3: 创建错误类型**

```typescript
// src/lib/errors.ts

export enum ErrorType {
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_ERROR = 'FILE_ERROR',
  FFMPEG_ERROR = 'FFMPEG_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
```

- [ ] **Step 4: 创建配置**

```typescript
// src/lib/config.ts

export const config = {
  deepseek: {
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.siliconflow.cn/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-v3.2',
    maxTokens: 2000,
  },

  jimeng: {
    baseUrl: process.env.JIMENG_API_URL || 'http://localhost:3000/v1',
    timeout: 120000,
  },

  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
    videoCodec: 'copy',
    audioCodec: 'aac',
  },

  storage: {
    uploadDir: './public/uploads',
    maxFileSize: 50 * 1024 * 1024,
    allowedAudioTypes: ['audio/mpeg', 'audio/wav'],
  },

  task: {
    timeout: 10 * 60 * 1000,
    maxRetries: 3,
    cleanupInterval: 24 * 60 * 60 * 1000,
  },
};

export function validateConfig(): void {
  if (!config.deepseek.apiKey) {
    throw new Error('DEEPSEEK_API_KEY is required');
  }
}
```

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat: add types, utils, errors and config"
```

---

## Task 4: 模板系统

**Files:**
- Create: `src/lib/templates/cozy-home.ts`
- Create: `src/lib/templates/index.ts`

- [ ] **Step 1: 创建治愈系家居模板**

```typescript
// src/lib/templates/cozy-home.ts
import { TemplateData } from '@/lib/types';

export const cozyHomeTemplate: TemplateData = {
  id: 'cozy-home',
  name: '温馨家居',
  category: '家居',
  description: '治愈系现代家居场景，温暖舒适的生活氛围',
  defaults: {
    style: '治愈系',
    scene: '现代家居',
    composition: '广角全景',
    lighting: '电影感光影',
    era: '现代',
    region: '岭南',
    culture: ['广府元素', '生活气息', '岭南建筑'],
  },
  promptTemplate: `{{style}}风格，{{scene}}场景，{{lighting}}。
{{composition}}构图，{{era}}年代，{{region}}地域特色。
{{culture}}文化元素，细节极其丰富，充满生活气息。
女主角是个漂亮的{{region}}女人，20多岁，动作自然不刻意摆拍。
{{description}}

色调温暖柔和，画面质感细腻，
就像电视剧和电影一样，经过精心艺术加工但真实自然，
让人产生向往的感觉，想要生活在里面。`,
};
```

- [ ] **Step 2: 创建模板索引**

```typescript
// src/lib/templates/index.ts
import { TemplateData } from '@/lib/types';
import { cozyHomeTemplate } from './cozy-home';

export const builtinTemplates: TemplateData[] = [
  cozyHomeTemplate,
  {
    id: 'nostalgic-90s',
    name: '90年代怀旧',
    category: '怀旧',
    description: '90年代复古风格，怀旧氛围',
    defaults: {
      style: '复古风',
      scene: '老式居民楼',
      composition: '中景',
      lighting: '自然光',
      era: '90年代',
      region: '岭南',
      culture: ['老广州', '怀旧元素'],
    },
    promptTemplate: `{{style}}，{{scene}}，{{lighting}}。
{{composition}}构图，{{era}}的{{region}}，{{culture}}。
老式家具、复古家电、怀旧装饰，充满年代感。
{{description}}

暖黄色调，胶片质感，
像老照片一样的柔和模糊，唤起美好回忆。`,
  },
  {
    id: 'jiangnan-water',
    name: '江南水乡',
    category: '风景',
    description: '江南水乡诗意场景，烟雨朦胧',
    defaults: {
      style: '诗意',
      scene: '江南水乡',
      composition: '全景',
      lighting: '柔和自然光',
      era: '现代',
      region: '江南',
      culture: ['小桥流水', '白墙黑瓦', '油纸伞'],
    },
    promptTemplate: `{{style}}的{{scene}}，{{lighting}}，{{composition}}。
{{region}}特有的{{culture}}，烟雨朦胧的意境。
{{description}}

水墨画般的淡雅色调，诗意盎然，
让人沉醉在东方美学的意境中。`,
  },
  {
    id: 'modern-minimal',
    name: '现代极简',
    category: '家居',
    description: '现代极简主义风格，简洁优雅',
    defaults: {
      style: '极简主义',
      scene: '现代公寓',
      composition: '对称构图',
      lighting: '自然光',
      era: '现代',
      region: '现代都市',
      culture: ['简约美学', '功能性设计'],
    },
    promptTemplate: `{{style}}风格的{{scene}}，{{lighting}}，{{composition}}。
{{culture}}，线条简洁，空间通透。
{{description}}

黑白灰为主调，点缀少量原木色，
极简而不简单，体现现代都市生活美学。`,
  },
  {
    id: 'rustic-country',
    name: '田园 rustic',
    category: '风景',
    description: '乡村田园风光，自然质朴',
    defaults: {
      style: '田园风',
      scene: '乡村小院',
      composition: '中景',
      lighting: '金色阳光',
      era: '现代',
      region: '乡村',
      culture: ['农家元素', '自然田园'],
    },
    promptTemplate: `{{style}}的{{scene}}，{{lighting}}洒落，{{composition}}。
{{region}}的{{culture}}，鲜花、果树、木栅栏。
{{description}}

明亮温暖的色调，充满生机，
回归自然的质朴生活，心灵栖息地。`,
  },
];

export function getTemplateById(id: string): TemplateData | undefined {
  return builtinTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): TemplateData[] {
  return builtinTemplates.filter((t) => t.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(builtinTemplates.map((t) => t.category))];
}

export function renderPromptTemplate(
  template: TemplateData,
  values: Partial<TemplateData['defaults']> & { description?: string }
): string {
  let prompt = template.promptTemplate;

  // 替换所有占位符
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    const replacement = Array.isArray(value) ? value.join('、') : String(value ?? '');
    prompt = prompt.replace(new RegExp(placeholder, 'g'), replacement);
  }

  // 清理未替换的占位符
  prompt = prompt.replace(/\{\{\w+\}\}/g, '');

  // 清理多余空行
  prompt = prompt.replace(/\n{3,}/g, '\n\n').trim();

  return prompt;
}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add template system with 5 builtin templates"
```

---

## Task 5: 提示词扩展服务

**Files:**
- Create: `src/lib/services/prompt-expander.ts`
- Create: `src/app/api/tasks/[id]/generate-prompt/route.ts`

- [ ] **Step 1: 创建提示词扩展服务**

```typescript
// src/lib/services/prompt-expander.ts
import { config } from '@/lib/config';
import { StructuredInput } from '@/lib/types';
import { AppError, ErrorType } from '@/lib/errors';
import { retryWithBackoff } from '@/lib/utils';
import { getTemplateById, renderPromptTemplate } from '@/lib/templates';

const SYSTEM_PROMPT = `你是一位专业的 AI 绘画提示词工程师。你的任务是将用户提供的基础画面描述扩展成详细、结构化的提示词，用于 AI 作画。

请遵循以下原则：
1. 分析用户提供的关键要素，挖掘它们之间的逻辑关系
2. 结合专业知识，完善和补充场景细节
3. 输出必须包含：主体描述、环境细节、光影效果、色彩氛围、构图视角
4. 使用中文输出，保持描述的具体性和画面感
5. 绝对禁止使用模板化、陈词滥调的描述
6. 发挥想象力，输出超越预期、极具原创性的场景构想

输出格式要求：
- 主体：[详细描述主体]
- 环境：[详细描述环境]
- 光影：[详细描述光影效果]
- 色彩：[详细描述色彩氛围]
- 构图：[详细描述构图视角]
- 整体氛围：[一句话总结氛围]`;

export async function expandPrompt(
  input: StructuredInput
): Promise<string> {
  const template = input.templateId ? getTemplateById(input.templateId) : null;

  // 构建基础提示词
  let basePrompt: string;
  if (template) {
    basePrompt = renderPromptTemplate(template, {
      ...template.defaults,
      ...input,
    });
  } else {
    // 无模板时的默认构建
    const parts = [
      input.style,
      input.scene,
      input.composition,
      input.lighting,
      input.era && input.region ? `${input.era}的${input.region}` : input.era || input.region,
      input.culture,
      input.description,
    ].filter(Boolean);
    basePrompt = parts.join('，');
  }

  // 调用 DeepSeek API 进行扩展
  return retryWithBackoff(() => callDeepSeekAPI(basePrompt), 3, 1000);
}

async function callDeepSeekAPI(basePrompt: string): Promise<string> {
  const response = await fetch(`${config.deepseek.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.deepseek.apiKey}`,
    },
    body: JSON.stringify({
      model: config.deepseek.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: basePrompt },
      ],
      max_tokens: config.deepseek.maxTokens,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new AppError(
      ErrorType.API_ERROR,
      `DeepSeek API error: ${response.status} - ${error}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AppError(
      ErrorType.API_ERROR,
      'Empty response from DeepSeek API'
    );
  }

  return content;
}
```

- [ ] **Step 2: 创建生成提示词 API 路由**

```typescript
// src/app/api/tasks/[id]/generate-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { expandPrompt } from '@/lib/services/prompt-expander';
import { AppError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // 更新状态为生成中
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'prompt_generating' },
    });

    const userInput = {
      templateId: task.templateId || undefined,
      style: task.style || undefined,
      scene: task.scene || undefined,
      composition: task.composition || undefined,
      lighting: task.lighting || undefined,
      era: task.era || undefined,
      region: task.region || undefined,
      culture: task.culture || undefined,
      description: task.description || undefined,
    };

    const prompt = await expandPrompt(userInput);

    // 更新任务
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'prompt_generated',
        prompt,
      },
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Generate prompt error:', error);

    // 更新错误状态
    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'error',
        errorMessage: error instanceof AppError ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to generate prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add prompt expansion service and API"
```

---

## Task 6: 即梦 API 客户端

**Files:**
- Create: `src/lib/services/jimeng-client.ts`
- Create: `src/app/api/tasks/[id]/generate-image/route.ts`
- Create: `src/app/api/tasks/[id]/generate-video/route.ts`

- [ ] **Step 1: 创建即梦 API 客户端**

```typescript
// src/lib/services/jimeng-client.ts
import { config } from '@/lib/config';
import { AppError, ErrorType } from '@/lib/errors';
import { delay, retryWithBackoff } from '@/lib/utils';

interface ImageGenerationRequest {
  prompt: string;
  n?: number;
  size?: string;
}

interface ImageGenerationResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

interface VideoGenerationRequest {
  image_url: string;
  prompt?: string;
}

interface VideoGenerationResponse {
  data: {
    url: string;
    status: string;
  };
}

export async function generateImages(
  prompt: string,
  n: number = 4
): Promise<string[]> {
  return retryWithBackoff(async () => {
    const response = await fetch(
      `${config.jimeng.baseUrl}/images/generations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          n,
          size: '1024x1024',
        } as ImageGenerationRequest),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new AppError(
        ErrorType.API_ERROR,
        `Jimeng image generation error: ${response.status} - ${error}`
      );
    }

    const data: ImageGenerationResponse = await response.json();
    return data.data.map((img) => img.url);
  }, 3, 2000);
}

export async function generateVideo(
  imageUrl: string,
  prompt?: string
): Promise<string> {
  return retryWithBackoff(async () => {
    const response = await fetch(
      `${config.jimeng.baseUrl}/videos/generations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt: prompt || 'Make this image come alive with subtle motion',
        } as VideoGenerationRequest),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new AppError(
        ErrorType.API_ERROR,
        `Jimeng video generation error: ${response.status} - ${error}`
      );
    }

    const data: VideoGenerationResponse = await response.json();

    // 等待视频生成完成
    if (data.data.status === 'processing') {
      await waitForVideoCompletion(data.data.url);
    }

    return data.data.url;
  }, 3, 2000);
}

async function waitForVideoCompletion(videoUrl: string): Promise<void> {
  const maxAttempts = 30;
  const interval = 5000; // 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    await delay(interval);

    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      if (response.ok) {
        return;
      }
    } catch {
      // 继续等待
    }
  }

  throw new AppError(
    ErrorType.TIMEOUT_ERROR,
    'Video generation timeout'
  );
}
```

- [ ] **Step 2: 创建文生图 API 路由**

```typescript
// src/app/api/tasks/[id]/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateImages } from '@/lib/services/jimeng-client';
import { AppError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (!task.prompt) {
      return NextResponse.json(
        { error: 'Prompt not generated yet' },
        { status: 400 }
      );
    }

    // 更新状态
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'image_generating' },
    });

    const imageUrls = await generateImages(task.prompt, 4);

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'image_generated',
        images: JSON.stringify(imageUrls),
      },
    });

    return NextResponse.json({
      success: true,
      images: imageUrls,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Generate image error:', error);

    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'error',
        errorMessage: error instanceof AppError ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to generate images',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 创建图生视频 API 路由**

```typescript
// src/app/api/tasks/[id]/generate-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateVideo } from '@/lib/services/jimeng-client';
import { AppError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const imageIndex = parseInt(searchParams.get('imageIndex') || '0', 10);

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const images = task.images ? JSON.parse(task.images) : [];
    if (!images.length || imageIndex >= images.length) {
      return NextResponse.json(
        { error: 'No images available' },
        { status: 400 }
      );
    }

    const selectedImage = images[imageIndex];

    // 更新状态
    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'video_generating',
        selectedImage,
      },
    });

    const videoUrl = await generateVideo(selectedImage, task.prompt || undefined);

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'video_generated',
        videoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Generate video error:', error);

    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'error',
        errorMessage: error instanceof AppError ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to generate video',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add Jimeng API client and image/video generation endpoints"
```

---

## Task 7: 视频处理服务

**Files:**
- Create: `src/lib/services/video-processor.ts`
- Create: `src/app/api/tasks/[id]/merge-audio/route.ts`

- [ ] **Step 1: 创建视频处理服务**

```typescript
// src/lib/services/video-processor.ts
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from '@/lib/config';
import { AppError, ErrorType } from '@/lib/errors';

export async function mergeAudioWithVideo(
  videoUrl: string,
  bgmPath: string,
  outputDir: string
): Promise<string> {
  // 验证 FFmpeg
  await verifyFFmpeg();

  // 下载视频到临时文件
  const videoPath = await downloadVideo(videoUrl, outputDir);

  // 生成输出路径
  const outputFilename = `final_${Date.now()}.mp4`;
  const outputPath = path.join(outputDir, outputFilename);

  // 执行 FFmpeg 合并
  await runFFmpeg(videoPath, bgmPath, outputPath);

  // 清理临时视频文件
  await fs.unlink(videoPath).catch(() => {});

  return outputPath;
}

async function verifyFFmpeg(): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(config.ffmpeg.path, ['-version']);

    ffmpeg.on('error', () => {
      reject(
        new AppError(
          ErrorType.FFMPEG_ERROR,
          'FFmpeg not found. Please install FFmpeg and ensure it is in your PATH.'
        )
      );
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new AppError(
            ErrorType.FFMPEG_ERROR,
            `FFmpeg check failed with code ${code}`
          )
        );
      }
    });
  });
}

async function downloadVideo(url: string, outputDir: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new AppError(
      ErrorType.NETWORK_ERROR,
      `Failed to download video: ${response.status}`
    );
  }

  const buffer = await response.arrayBuffer();
  const tempPath = path.join(outputDir, `temp_video_${Date.now()}.mp4`);

  await fs.writeFile(tempPath, Buffer.from(buffer));

  return tempPath;
}

async function runFFmpeg(
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', config.ffmpeg.videoCodec,
      '-c:a', config.ffmpeg.audioCodec,
      '-shortest',
      '-pix_fmt', 'yuv420p',
      '-y',
      outputPath,
    ];

    const ffmpeg = spawn(config.ffmpeg.path, args);
    let errorOutput = '';

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new AppError(
            ErrorType.FFMPEG_ERROR,
            `FFmpeg failed: ${errorOutput || `exit code ${code}`}`
          )
        );
      }
    });

    ffmpeg.on('error', (error) => {
      reject(
        new AppError(
          ErrorType.FFMPEG_ERROR,
          `FFmpeg error: ${error.message}`
        )
      );
    });
  });
}

export async function validateAudioFile(filePath: string): Promise<void> {
  const stats = await fs.stat(filePath);

  if (stats.size > config.storage.maxFileSize) {
    throw new AppError(
      ErrorType.VALIDATION_ERROR,
      `Audio file too large. Max size: ${config.storage.maxFileSize / 1024 / 1024}MB`
    );
  }
}
```

- [ ] **Step 2: 创建合并配乐 API 路由**

```typescript
// src/app/api/tasks/[id]/merge-audio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { mergeAudioWithVideo, validateAudioFile } from '@/lib/services/video-processor';
import { AppError } from '@/lib/errors';
import { config } from '@/lib/config';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (!task.videoUrl) {
      return NextResponse.json(
        { error: 'Video not generated yet' },
        { status: 400 }
      );
    }

    // 保存上传的音频文件
    const uploadDir = config.storage.uploadDir;
    const audioFilename = `bgm_${params.id}_${Date.now()}.mp3`;
    const audioPath = path.join(uploadDir, audioFilename);

    const bytes = await audioFile.arrayBuffer();
    await Bun.write(audioPath, bytes);

    // 验证音频文件
    await validateAudioFile(audioPath);

    // 更新状态
    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'merging',
        bgmPath: audioPath,
      },
    });

    // 合并音视频
    const finalVideoPath = await mergeAudioWithVideo(
      task.videoUrl,
      audioPath,
      uploadDir
    );

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        finalVideoPath,
      },
    });

    return NextResponse.json({
      success: true,
      finalVideoPath,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Merge audio error:', error);

    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'error',
        errorMessage: error instanceof AppError ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to merge audio',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add video processing service and audio merge endpoint"
```

---

## Task 8: 发布辅助生成服务

**Files:**
- Create: `src/lib/services/publish-helper.ts`
- Create: `src/app/api/tasks/[id]/generate-publish/route.ts`

- [ ] **Step 1: 创建发布辅助生成服务**

```typescript
// src/lib/services/publish-helper.ts
import { config } from '@/lib/config';
import { PublishContent, StructuredInput } from '@/lib/types';
import { AppError, ErrorType } from '@/lib/errors';
import { retryWithBackoff } from '@/lib/utils';

const SYSTEM_PROMPT = `你是一位专业的短视频内容策划师。请根据视频的创作风格和主题，为视频号生成吸引眼球的发布内容。

请生成以下内容：
1. 视频标题（10-20字）：简短有力，吸引点击
2. 视频文案（100-200字）：配合视频内容，引发共鸣
3. 推荐标签（5-10个）：带 # 号，提高曝光

要求：
- 标题要引起好奇心或情感共鸣
- 文案要有故事感，让人想看完视频
- 标签要精准，覆盖热门话题
- 整体风格与视频创作理念保持一致`;

export async function generatePublishContent(
  input: StructuredInput,
  prompt: string | null
): Promise<PublishContent> {
  const userContent = `
创作信息：
- 风格：${input.style || '治愈系'}
- 场景：${input.scene || '现代家居'}
- 年代：${input.era || '现代'}
- 地域：${input.region || '中国'}
- 文化元素：${input.culture || '生活气息'}
- 描述：${input.description || '一个温暖治愈的生活场景'}

扩展提示词：
${prompt || '无'}

请生成视频号发布内容。
`;

  return retryWithBackoff(
    () => callDeepSeekAPI(userContent),
    3,
    1000
  );
}

async function callDeepSeekAPI(userContent: string): Promise<PublishContent> {
  const response = await fetch(`${config.deepseek.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.deepseek.apiKey}`,
    },
    body: JSON.stringify({
      model: config.deepseek.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new AppError(
      ErrorType.API_ERROR,
      `DeepSeek API error: ${response.status} - ${error}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AppError(
      ErrorType.API_ERROR,
      'Empty response from DeepSeek API'
    );
  }

  return parsePublishContent(content);
}

function parsePublishContent(content: string): PublishContent {
  // 解析 AI 返回的内容
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

  let title = '';
  let description = '';
  const tags: string[] = [];

  let currentSection: 'title' | 'desc' | 'tags' | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('标题') || lowerLine.includes('title')) {
      currentSection = 'title';
      const match = line.match(/[:：]\s*(.+)/);
      if (match) title = match[1].trim();
      continue;
    }

    if (lowerLine.includes('文案') || lowerLine.includes('描述') || lowerLine.includes('content')) {
      currentSection = 'desc';
      const match = line.match(/[:：]\s*(.+)/);
      if (match) description = match[1].trim();
      continue;
    }

    if (lowerLine.includes('标签') || lowerLine.includes('tag') || lowerLine.includes('话题')) {
      currentSection = 'tags';
      const tagMatches = line.match(/#[^\s#]+/g);
      if (tagMatches) tags.push(...tagMatches);
      continue;
    }

    // 继续当前段落
    if (currentSection === 'title' && !title) {
      title = line;
    } else if (currentSection === 'desc') {
      description += (description ? '\n' : '') + line;
    } else if (currentSection === 'tags') {
      const tagMatches = line.match(/#[^\s#]+/g);
      if (tagMatches) tags.push(...tagMatches);
    }
  }

  // 默认值
  if (!title) title = '温暖治愈的生活瞬间';
  if (!description) description = '在这个忙碌的世界里，找到属于自己的宁静角落。';
  if (tags.length === 0) {
    tags.push('#治愈系', '#生活美学', '#慢生活');
  }

  return {
    title: title.slice(0, 50),
    content: description.slice(0, 500),
    tags: tags.slice(0, 10),
  };
}
```

- [ ] **Step 2: 创建生成发布内容 API 路由**

```typescript
// src/app/api/tasks/[id]/generate-publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generatePublishContent } from '@/lib/services/publish-helper';
import { AppError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const userInput = {
      templateId: task.templateId || undefined,
      style: task.style || undefined,
      scene: task.scene || undefined,
      composition: task.composition || undefined,
      lighting: task.lighting || undefined,
      era: task.era || undefined,
      region: task.region || undefined,
      culture: task.culture || undefined,
      description: task.description || undefined,
    };

    const publishContent = await generatePublishContent(
      userInput,
      task.prompt
    );

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: publishContent.title,
        content: publishContent.content,
        tags: JSON.stringify(publishContent.tags),
      },
    });

    return NextResponse.json({
      success: true,
      publishContent,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Generate publish content error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate publish content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add publish content generation service and API"
```

---

## Task 9: 任务管理 API

**Files:**
- Create: `src/app/api/tasks/route.ts`
- Create: `src/app/api/tasks/[id]/route.ts`

- [ ] **Step 1: 创建任务列表和创建 API**

```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TaskMode } from '@/lib/types';

// GET /api/tasks - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.task.count();

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - 创建新任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode,
      templateId,
      style,
      scene,
      composition,
      lighting,
      era,
      region,
      culture,
      description,
    } = body;

    if (!mode || !['auto', 'step'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "auto" or "step"' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        status: 'pending',
        mode: mode as TaskMode,
        templateId,
        style,
        scene,
        composition,
        lighting,
        era,
        region,
        culture,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      task,
    }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 创建单个任务操作 API**

```typescript
// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/tasks/[id] - 获取单个任务
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - 更新任务
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      status,
      prompt,
      selectedImage,
      videoUrl,
      finalVideoPath,
      title,
      content,
      tags,
    } = body;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(prompt && { prompt }),
        ...(selectedImage && { selectedImage }),
        ...(videoUrl && { videoUrl }),
        ...(finalVideoPath && { finalVideoPath }),
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags: JSON.stringify(tags) }),
      },
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - 删除任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add task management APIs"
```

---

## Task 10: 模板 API

**Files:**
- Create: `src/app/api/templates/route.ts`

- [ ] **Step 1: 创建模板 API**

```typescript
// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { builtinTemplates, getAllCategories } from '@/lib/templates';
import { prisma } from '@/lib/db';

// GET /api/templates - 获取所有模板
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 获取内置模板
    let templates = [...builtinTemplates];

    // 获取用户自定义模板
    const customTemplates = await prisma.template.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // 转换格式并合并
    const customFormatted = customTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description || undefined,
      defaults: JSON.parse(t.defaults),
      promptTemplate: t.promptTemplate,
    }));

    templates = [...templates, ...customFormatted];

    if (category) {
      templates = templates.filter((t) => t.category === category);
    }

    const categories = getAllCategories();

    return NextResponse.json({
      templates,
      categories,
    });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - 创建自定义模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, description, defaults, promptTemplate } = body;

    if (!name || !category || !defaults || !promptTemplate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        category,
        description,
        defaults: JSON.stringify(defaults),
        promptTemplate,
        isBuiltin: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        template,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat: add template API"
```

---

## Task 11: 全局样式与布局

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: 创建全局样式**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: 创建根布局**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '言画 - AI 视频创作',
  description: '自动化 AI 视频创作工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <a href="/" className="text-xl font-bold text-gray-900">
                  言画
                </a>
                <nav className="flex gap-4">
                  <a
                    href="/"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    首页
                  </a>
                  <a
                    href="/create"
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                  >
                    新建创作
                  </a>
                  <a
                    href="/templates"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    模板
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 创建 Button 组件**

```typescript
// src/components/ui/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

- [ ] **Step 4: 创建 Card 组件**

```typescript
// src/components/ui/card.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat: add global styles, layout and base UI components"
```

---

## Task 12: 首页/仪表盘

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: 创建首页**

```typescript
// src/app/page.tsx
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getTasks() {
  return prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '等待中',
    prompt_generating: '生成提示词中',
    prompt_generated: '提示词已生成',
    image_generating: '生成图片中',
    image_generated: '图片已生成',
    video_generating: '生成视频中',
    video_generated: '视频已生成',
    merging: '合并音视频中',
    completed: '已完成',
    error: '出错了',
  };
  return statusMap[status] || status;
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    prompt_generating: 'bg-blue-100 text-blue-800',
    prompt_generated: 'bg-blue-100 text-blue-800',
    image_generating: 'bg-purple-100 text-purple-800',
    image_generated: 'bg-purple-100 text-purple-800',
    video_generating: 'bg-orange-100 text-orange-800',
    video_generated: 'bg-orange-100 text-orange-800',
    merging: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

export default async function HomePage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
          <p className="mt-2 text-gray-600">管理和查看您的视频创作任务</p>
        </div>
        <Link href="/create">
          <Button size="lg">+ 新建创作</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">还没有创建任何任务</p>
              <Link href="/create">
                <Button>开始第一个创作</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {task.style} · {task.scene}
                    </CardTitle>
                    <CardDescription>
                      {formatDate(task.createdAt)}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {getStatusText(task.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 text-sm text-gray-600">
                  {task.era && <span>年代: {task.era}</span>}
                  {task.region && <span>· 地域: {task.region}</span>}
                  {task.composition && <span>· 构图: {task.composition}</span>}
                </div>
                <div className="mt-4">
                  <Link href={`/task/${task.id}`}>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat: add homepage with task list"
```

---

## Task 13: 创建任务页（结构化表单）

**Files:**
- Create: `src/app/create/page.tsx`
- Create: `src/components/forms/TemplateSelector.tsx`
- Create: `src/components/forms/StyleSelector.tsx`

- [ ] **Step 1: 创建模板选择组件**

```typescript
// src/components/forms/TemplateSelector.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { builtinTemplates } from '@/lib/templates';
import { TemplateData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  selectedId: string | null;
  onSelect: (template: TemplateData | null) => void;
}

export function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  const categories = [...new Set(builtinTemplates.map((t) => t.category))];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">选择模板</h3>
        <p className="text-sm text-gray-500">选择一个预设模板快速开始</p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {builtinTemplates
              .filter((t) => t.category === category)
              .map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedId === template.id
                      ? 'ring-2 ring-gray-900'
                      : 'hover:border-gray-300'
                  )}
                  onClick={() => onSelect(template)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {template.defaults.style && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {template.defaults.style}
                        </span>
                      )}
                      {template.defaults.scene && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {template.defaults.scene}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          selectedId === null
            ? 'ring-2 ring-gray-900'
            : 'hover:border-gray-300'
        )}
        onClick={() => onSelect(null)}
      >
        <CardHeader>
          <CardTitle className="text-base">自定义</CardTitle>
          <CardDescription>不选择模板，完全自定义创作</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: 创建风格选择组件**

```typescript
// src/components/forms/StyleSelector.tsx
'use client';

import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface StyleSelectorProps {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
}

export function StyleSelector({ label, options, value, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'px-3 py-2 rounded-md text-sm transition-colors',
              value === option.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建创建任务页**

```typescript
// src/app/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateSelector } from '@/components/forms/TemplateSelector';
import { StyleSelector } from '@/components/forms/StyleSelector';
import { TemplateData, TaskMode } from '@/lib/types';

const STYLE_OPTIONS = [
  { value: '治愈系', label: '治愈系' },
  { value: '复古风', label: '复古风' },
  { value: '极简主义', label: '极简主义' },
  { value: '诗意', label: '诗意' },
  { value: '田园风', label: '田园风' },
];

const SCENE_OPTIONS = [
  { value: '现代家居', label: '现代家居' },
  { value: '老式居民楼', label: '老式居民楼' },
  { value: '江南水乡', label: '江南水乡' },
  { value: '现代公寓', label: '现代公寓' },
  { value: '乡村小院', label: '乡村小院' },
];

const COMPOSITION_OPTIONS = [
  { value: '广角全景', label: '广角全景' },
  { value: '中景', label: '中景' },
  { value: '特写', label: '特写' },
  { value: '俯视', label: '俯视' },
  { value: '对称构图', label: '对称构图' },
];

const LIGHTING_OPTIONS = [
  { value: '电影感光影', label: '电影感光影' },
  { value: '自然光', label: '自然光' },
  { value: '暖色调', label: '暖色调' },
  { value: '冷色调', label: '冷色调' },
  { value: '柔和自然光', label: '柔和自然光' },
];

const ERA_OPTIONS = [
  { value: '现代', label: '现代' },
  { value: '90年代', label: '90年代' },
  { value: '古风', label: '古风' },
  { value: '民国', label: '民国' },
];

const REGION_OPTIONS = [
  { value: '岭南', label: '岭南' },
  { value: '江南', label: '江南' },
  { value: '西北', label: '西北' },
  { value: '西南', label: '西南' },
  { value: '华北', label: '华北' },
];

export default function CreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [mode, setMode] = useState<TaskMode>('step');

  const [formData, setFormData] = useState({
    style: '',
    scene: '',
    composition: '',
    lighting: '',
    era: '',
    region: '',
    culture: '',
    description: '',
  });

  const handleTemplateSelect = (template: TemplateData | null) => {
    setSelectedTemplate(template);
    if (template) {
      setFormData({
        style: template.defaults.style,
        scene: template.defaults.scene,
        composition: template.defaults.composition,
        lighting: template.defaults.lighting,
        era: template.defaults.era,
        region: template.defaults.region,
        culture: template.defaults.culture.join('、'),
        description: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          templateId: selectedTemplate?.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      router.push(`/task/${data.task.id}`);
    } catch (error) {
      console.error('Create task error:', error);
      alert('创建任务失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">新建创作</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 模式选择 */}
        <Card>
          <CardHeader>
            <CardTitle>执行模式</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="step"
                  checked={mode === 'step'}
                  onChange={() => setMode('step')}
                  className="w-4 h-4"
                />
                <span>分步模式 - 每步可预览和编辑</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="auto"
                  checked={mode === 'auto'}
                  onChange={() => setMode('auto')}
                  className="w-4 h-4"
                />
                <span>全自动模式 - 一键完成</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 模板选择 */}
        <TemplateSelector
          selectedId={selectedTemplate?.id || null}
          onSelect={handleTemplateSelect}
        />

        {/* 详细配置 */}
        <Card>
          <CardHeader>
            <CardTitle>详细配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <StyleSelector
              label="风格"
              options={STYLE_OPTIONS}
              value={formData.style}
              onChange={(value) => setFormData({ ...formData, style: value })}
            />

            <StyleSelector
              label="场景"
              options={SCENE_OPTIONS}
              value={formData.scene}
              onChange={(value) => setFormData({ ...formData, scene: value })}
            />

            <StyleSelector
              label="构图"
              options={COMPOSITION_OPTIONS}
              value={formData.composition}
              onChange={(value) => setFormData({ ...formData, composition: value })}
            />

            <StyleSelector
              label="光影"
              options={LIGHTING_OPTIONS}
              value={formData.lighting}
              onChange={(value) => setFormData({ ...formData, lighting: value })}
            />

            <StyleSelector
              label="年代"
              options={ERA_OPTIONS}
              value={formData.era}
              onChange={(value) => setFormData({ ...formData, era: value })}
            />

            <StyleSelector
              label="地域"
              options={REGION_OPTIONS}
              value={formData.region}
              onChange={(value) => setFormData({ ...formData, region: value })}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">文化元素</label>
              <input
                type="text"
                value={formData.culture}
                onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                placeholder="例如：广府元素、生活气息、岭南建筑"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">补充描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="补充任何你想添加的细节..."
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? '创建中...' : '开始创作'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add create task page with structured form"
```

---

## Task 14: 任务详情页（分步工作流）

**Files:**
- Create: `src/app/task/[id]/page.tsx`
- Create: `src/components/workflow/StepIndicator.tsx`
- Create: `src/components/workflow/PromptEditor.tsx`

- [ ] **Step 1: 创建步骤指示器**

```typescript
// src/components/workflow/StepIndicator.tsx
'use client';

import { cn } from '@/lib/utils';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                step.status === 'completed' && 'bg-green-500 text-white',
                step.status === 'current' && 'bg-gray-900 text-white',
                step.status === 'error' && 'bg-red-500 text-white',
                step.status === 'pending' && 'bg-gray-200 text-gray-500'
              )}
            >
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <span className="mt-2 text-xs text-gray-600">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-16 h-0.5 mx-2',
                index < currentStep ? 'bg-green-500' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建提示词编辑器**

```typescript
// src/components/workflow/PromptEditor.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PromptEditorProps {
  prompt: string;
  onChange: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function PromptEditor({ prompt, onChange, onSubmit, isLoading }: PromptEditorProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">AI 生成的提示词</label>
          <p className="text-xs text-gray-500 mt-1">
            您可以编辑此提示词以获得更好的效果
          </p>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border rounded-md font-mono text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onSubmit} disabled={isLoading || !prompt.trim()}>
            {isLoading ? '生成中...' : '下一步：生成图片'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: 创建任务详情页**

```typescript
// src/app/task/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/workflow/StepIndicator';
import { PromptEditor } from '@/components/workflow/PromptEditor';
import { TaskResponse, TaskStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const STEPS = [
  { id: 'prompt', label: '生成提示词' },
  { id: 'image', label: '生成图片' },
  { id: 'video', label: '生成视频' },
  { id: 'audio', label: '合并配乐' },
  { id: 'publish', label: '发布内容' },
];

export default function TaskPage() {
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  useEffect(() => {
    if (task?.prompt) {
      setEditedPrompt(task.prompt);
    }
  }, [task?.prompt]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const data = await response.json();
      setTask(data.task);
    } catch (err) {
      setError('获取任务失败');
    }
  };

  const getCurrentStepIndex = (status: TaskStatus): number => {
    const stepMap: Record<string, number> = {
      pending: 0,
      prompt_generating: 0,
      prompt_generated: 1,
      image_generating: 1,
      image_generated: 2,
      video_generating: 2,
      video_generated: 3,
      merging: 3,
      completed: 4,
      error: -1,
    };
    return stepMap[status] ?? 0;
  };

  const generatePrompt = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/generate-prompt`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate prompt');
      await fetchTask();
    } catch (err) {
      setError('生成提示词失败');
    } finally {
      setIsLoading(false);
    }
  };

  const generateImages = async () => {
    // 先更新提示词
    if (editedPrompt !== task?.prompt) {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: editedPrompt }),
      });
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/generate-image`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate images');
      await fetchTask();
    } catch (err) {
      setError('生成图片失败');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tasks/${taskId}/generate-video?imageIndex=${selectedImageIndex}`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to generate video');
      await fetchTask();
    } catch (err) {
      setError('生成视频失败');
    } finally {
      setIsLoading(false);
    }
  };

  const mergeAudio = async () => {
    if (!audioFile) {
      setError('请选择配乐文件');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch(`/api/tasks/${taskId}/merge-audio`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to merge audio');
      await fetchTask();
    } catch (err) {
      setError('合并配乐失败');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePublish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/generate-publish`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate publish content');
      await fetchTask();
    } catch (err) {
      setError('生成发布内容失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!task) {
    return <div className="text-center py-12">加载中...</div>;
  }

  const currentStep = getCurrentStepIndex(task.status);
  const stepStatuses = STEPS.map((step, index) => {
    if (task.status === 'error') return 'error';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  });

  const images = task.images ? JSON.parse(task.images) : [];
  const tags = task.tags ? JSON.parse(task.tags) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">创作任务</h1>
          <p className="text-sm text-gray-500">创建于 {formatDate(task.createdAt)}</p>
        </div>
        <div className="text-sm text-gray-600">
          模式: {task.mode === 'auto' ? '全自动' : '分步'}
        </div>
      </div>

      <StepIndicator
        steps={STEPS.map((step, index) => ({
          ...step,
          status: stepStatuses[index] as any,
        }))}
        currentStep={currentStep}
      />

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-sm underline"
          >
            关闭
          </button>
        </div>
      )}

      {/* Step 1: 提示词 */}
      {(task.status === 'pending' || task.status === 'prompt_generating') && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">点击下方按钮生成 AI 绘画提示词</p>
            <Button onClick={generatePrompt} disabled={isLoading}>
              {isLoading ? '生成中...' : '生成提示词'}
            </Button>
          </CardContent>
        </Card>
      )}

      {(task.status === 'prompt_generated' ||
        task.status === 'image_generating') && (
        <PromptEditor
          prompt={editedPrompt}
          onChange={setEditedPrompt}
          onSubmit={generateImages}
          isLoading={isLoading || task.status === 'image_generating'}
        />
      )}

      {/* Step 2: 图片选择 */}
      {images.length > 0 && currentStep >= 1 && (
        <Card>
          <CardHeader>
            <CardTitle>选择图片</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {images.map((url: string, index: number) => (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                    selectedImageIndex === index
                      ? 'border-gray-900'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
            {currentStep === 1 && (
              <div className="mt-4 flex justify-end">
                <Button onClick={generateVideo} disabled={isLoading}>
                  {isLoading ? '生成中...' : '下一步：生成视频'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: 视频预览 */}
      {task.videoUrl && currentStep >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>视频预览</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={task.videoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
            {currentStep === 2 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上传配乐 (MP3/WAV)
                </label>
                <input
                  type="file"
                  accept="audio/mpeg,audio/wav"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={mergeAudio}
                    disabled={isLoading || !audioFile}
                  >
                    {isLoading ? '合并中...' : '合并配乐'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: 最终视频 */}
      {task.finalVideoPath && currentStep >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>最终视频</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={task.finalVideoPath.replace('./public', '')}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
            {currentStep === 3 && (
              <div className="mt-4 flex justify-end">
                <Button onClick={generatePublish} disabled={isLoading}>
                  {isLoading ? '生成中...' : '生成发布内容'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: 发布内容 */}
      {(task.title || currentStep === 4) && (
        <Card>
          <CardHeader>
            <CardTitle>发布辅助内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">标题</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md">{task.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">文案</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                {task.content}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">标签</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const text = `${task.title}\n\n${task.content}\n\n${tags.join(' ')}`;
                  navigator.clipboard.writeText(text);
                  alert('已复制到剪贴板');
                }}
              >
                复制全部内容
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误状态 */}
      {task.status === 'error' && task.errorMessage && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">任务出错</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{task.errorMessage}</p>
            <div className="mt-4">
              <Button onClick={fetchTask} variant="outline">
                刷新状态
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add task detail page with step-by-step workflow"
```

---

## Task 15: 模板管理页

**Files:**
- Create: `src/app/templates/page.tsx`

- [ ] **Step 1: 创建模板管理页**

```typescript
// src/app/templates/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateData } from '@/lib/types';

interface TemplateResponse {
  templates: TemplateData[];
  categories: string[];
}

export default function TemplatesPage() {
  const [data, setData] = useState<TemplateResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const filteredTemplates = selectedCategory
    ? data?.templates.filter((t) => t.category === selectedCategory)
    : data?.templates;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">模板库</h1>
          <p className="mt-2 text-gray-600">选择或创建模板来加速您的创作</p>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          全部
        </Button>
        {data?.categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {template.category}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{template.description}</p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">默认配置：</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(template.defaults)
                    .filter(([_, value]) => value)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {Array.isArray(value) ? value.join('、') : value}
                      </span>
                    ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  window.location.href = `/create?template=${template.id}`;
                }}
              >
                使用此模板
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无模板</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat: add template management page"
```

---

## Task 16: 全自动模式支持

**Files:**
- Create: `src/app/api/tasks/[id]/auto-run/route.ts`

- [ ] **Step 1: 创建全自动运行 API**

```typescript
// src/app/api/tasks/[id]/auto-run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { expandPrompt } from '@/lib/services/prompt-expander';
import { generateImages, generateVideo } from '@/lib/services/jimeng-client';
import { mergeAudioWithVideo } from '@/lib/services/video-processor';
import { generatePublishContent } from '@/lib/services/publish-helper';
import { AppError } from '@/lib/errors';
import { config } from '@/lib/config';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const uploadDir = config.storage.uploadDir;

  try {
    let task = await prisma.task.findUnique({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.mode !== 'auto') {
      return NextResponse.json(
        { error: 'Task is not in auto mode' },
        { status: 400 }
      );
    }

    const userInput = {
      templateId: task.templateId || undefined,
      style: task.style || undefined,
      scene: task.scene || undefined,
      composition: task.composition || undefined,
      lighting: task.lighting || undefined,
      era: task.era || undefined,
      region: task.region || undefined,
      culture: task.culture || undefined,
      description: task.description || undefined,
    };

    // Step 1: Generate prompt
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'prompt_generating' },
    });

    const prompt = await expandPrompt(userInput);
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'prompt_generated', prompt },
    });

    // Step 2: Generate images
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'image_generating' },
    });

    const imageUrls = await generateImages(prompt, 4);
    const selectedImage = imageUrls[0];
    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'image_generated',
        images: JSON.stringify(imageUrls),
        selectedImage,
      },
    });

    // Step 3: Generate video
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'video_generating' },
    });

    const videoUrl = await generateVideo(selectedImage, prompt);
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'video_generated', videoUrl },
    });

    // Note: In auto mode, audio merge is skipped as it requires user file upload
    // Video generation is considered complete for auto mode

    // Step 4: Generate publish content
    const publishContent = await generatePublishContent(userInput, prompt);
    task = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        title: publishContent.title,
        content: publishContent.content,
        tags: JSON.stringify(publishContent.tags),
      },
    });

    return NextResponse.json({
      success: true,
      task,
      message: 'Auto mode completed. Please upload audio file in step mode to merge.',
    });
  } catch (error) {
    console.error('Auto run error:', error);

    await prisma.task.update({
      where: { id: params.id },
      data: {
        status: 'error',
        errorMessage: error instanceof AppError ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        error: 'Auto run failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: 更新任务详情页支持全自动模式**

需要在任务详情页添加对全自动模式的支持，当检测到 mode 为 'auto' 且 status 为 'pending' 时，自动调用 auto-run API。

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add auto-run API for full automation mode"
```

---

## Task 17: 环境检查与启动脚本

**Files:**
- Create: `scripts/check-env.ts`
- Create: `README.md`

- [ ] **Step 1: 创建环境检查脚本**

```typescript
// scripts/check-env.ts
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { config } from '../src/lib/config';

function checkFFmpeg(): boolean {
  try {
    execSync(`${config.ffmpeg.path} -version`, { stdio: 'ignore' });
    console.log('✓ FFmpeg is installed');
    return true;
  } catch {
    console.error('✗ FFmpeg is not installed or not in PATH');
    console.error('  Please install FFmpeg: https://ffmpeg.org/download.html');
    return false;
  }
}

function checkEnvVars(): boolean {
  let ok = true;

  if (!config.deepseek.apiKey) {
    console.error('✗ DEEPSEEK_API_KEY is not set');
    ok = false;
  } else {
    console.log('✓ DEEPSEEK_API_KEY is set');
  }

  return ok;
}

function checkUploadDir(): boolean {
  const dir = config.storage.uploadDir;
  if (!existsSync(dir)) {
    console.log(`Creating upload directory: ${dir}`);
    try {
      execSync(`mkdir -p ${dir}`);
      console.log('✓ Upload directory created');
      return true;
    } catch {
      console.error(`✗ Failed to create upload directory: ${dir}`);
      return false;
    }
  }
  console.log('✓ Upload directory exists');
  return true;
}

function main() {
  console.log('Checking environment for Yanhua...\n');

  const checks = [checkFFmpeg(), checkEnvVars(), checkUploadDir()];

  console.log('');
  if (checks.every(Boolean)) {
    console.log('All checks passed! You can start the app with: npm run dev');
    process.exit(0);
  } else {
    console.log('Some checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: 更新 package.json 添加检查脚本**

修改 `package.json` 添加：
```json
"scripts": {
  "check-env": "tsx scripts/check-env.ts",
  // ... 其他脚本
}
```

添加开发依赖：
```json
"devDependencies": {
  "tsx": "^4.7.0",
  // ... 其他依赖
}
```

- [ ] **Step 3: 创建 README**

```markdown
# 言画 (Yanhua) - AI 视频创作工具

自动化 AI 视频创作工作流：结构化输入 → 提示词扩展 → 文生图 → 图生视频 → 配乐合并 → 发布辅助

## 前置要求

- Node.js >= 18.x
- FFmpeg (视频处理)
- jimeng-free-api-all (本地部署)

## 快速开始

1. 克隆仓库
\`\`\`bash
git clone <repo-url>
cd yanhua
\`\`\`

2. 安装依赖
\`\`\`bash
npm install
\`\`\`

3. 配置环境变量
\`\`\`bash
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY
\`\`\`

4. 检查环境
\`\`\`bash
npm run check-env
\`\`\`

5. 初始化数据库
\`\`\`bash
npx prisma migrate dev
\`\`\`

6. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000

## 使用说明

### 前置依赖

**jimeng-free-api-all**: 需要在本地运行
\`\`\`bash
# 按照项目文档启动 jimeng-free-api-all
docker run -d -p 3000:3000 <jimeng-image>
\`\`\`

### 工作流程

1. **创建任务**: 选择模板或自定义，填写创作参数
2. **生成提示词**: AI 自动扩展详细提示词
3. **选择图片**: 从生成的图片中选择最满意的一张
4. **生成视频**: 将图片转换为动态视频
5. **合并配乐**: 上传配乐文件，与视频合并
6. **发布内容**: 获取标题、文案和标签

## 技术栈

- Next.js 14 + React + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite
- FFmpeg (视频处理)

## 许可证

MIT
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add environment check script and documentation"
```

---

## Task 18: 最终验证与提交

- [ ] **Step 1: 运行类型检查**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 2: 运行环境检查**

Run: `npm run check-env`
Expected: 所有检查通过（如 FFmpeg 已安装、环境变量已设置）

- [ ] **Step 3: 构建测试**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 4: 最终提交**

```bash
git add .
git commit -m "chore: finalize implementation and verify build"
```

---

## 总结

本实施计划包含 18 个任务，涵盖：

1. 项目初始化和依赖安装
2. 数据库模型和 Prisma 配置
3. 类型定义、工具函数和配置
4. 模板系统（5 个内置模板）
5. 提示词扩展服务（集成硅基流动 DeepSeek）
6. 即梦 API 客户端（文生图、图生视频）
7. 视频处理服务（FFmpeg 合并配乐）
8. 发布辅助生成服务
9. 任务管理 API
10. 模板管理 API
11. 全局样式和布局
12. 首页/仪表盘
13. 创建任务页（结构化表单）
14. 任务详情页（分步工作流）
15. 模板管理页
16. 全自动模式支持
17. 环境检查与文档
18. 最终验证

所有任务完成后，系统将具备：
- ✅ 结构化输入表单 + 5 个内置模板
- ✅ 全自动和分步两种执行模式
- ✅ 集成硅基流动 DeepSeek API
- ✅ 集成本地 jimeng-free-api-all
- ✅ FFmpeg 音视频合并
- ✅ 视频号发布辅助内容生成
- ✅ 完整的 Web UI

**总预估时间**: 约 4-6 小时（取决于开发者熟练度）
