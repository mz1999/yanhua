# 言画视频创作自动化系统 - 设计文档

**日期**: 2026-03-23
**版本**: v1.0
**状态**: 待审核

---

## 1. 项目概述

### 1.1 背景
用户目前使用 AI 辅助进行视频创作，流程包括：
1. 将零散想法输入给 DeepSeek 扩展成详细提示词
2. 在即梦进行文生图
3. 在即梦进行图生视频
4. 在剪映添加配乐
5. 发布到视频号

整个过程需要多个工具和手动操作，效率较低。

### 1.2 目标
构建一个 Web 应用，将上述流程自动化，支持：
- 结构化输入（模板库）替代零散文本
- 全自动和分步两种执行模式
- 本地部署，保护创作隐私
- 可维护的模板系统

### 1.3 成功标准
- 用户从想法到最终视频的时间缩短 80%
- 支持至少 10 种可配置的模板
- 视频生成成功率 > 95%
- 界面友好，无需技术背景即可使用

---

## 2. 系统架构

### 2.1 技术栈
- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React Context
- **数据库**: SQLite (via Prisma ORM)
- **文件存储**: 本地文件系统

### 2.2 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 应用                              │
├──────────────┬──────────────────────┬───────────────────────────┤
│   Web UI     │    API Routes        │    任务队列 (内存/简单)    │
│  (React)     │   /api/*             │                           │
└──────┬───────┴──────────┬───────────┴───────────┬───────────────┘
       │                  │                       │
       │  1. 提交想法     │  2. 调用 DeepSeek API │
       │                  │     (硅基流动)         │
       │                  │                       │
       │  3. 展示结果     │  4. 调用 jimeng-free  │
       │                  │     (本地:3000)        │
       │                  │                       │
       │  5. 上传配乐     │  6. FFmpeg 合并音视频  │
       │                  │                       │
       │  7. 生成文案     │                       │
       └──────────────────┴───────────────────────┘
```

### 2.3 外部依赖
- **硅基流动 DeepSeek API**: 提示词扩展、发布文案生成
- **jimeng-free-api-all**: 本地部署的即梦 API 服务
- **FFmpeg**: 视频配乐合并
- **SQLite**: 任务数据持久化

### 2.4 API 响应格式规范

统一所有 API 响应格式：

```typescript
// 成功响应
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

// 错误响应
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;      // 错误代码，如 'TASK_NOT_FOUND'
    message: string;   // 用户友好的错误消息
    details?: any;     // 可选的详细错误信息
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 使用示例
// 成功: { success: true, data: { task: {...} } }
// 失败: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }
```

**错误代码规范**:
| 错误代码 | 含义 | HTTP 状态码 |
|----------|------|-------------|
| `TASK_NOT_FOUND` | 任务不存在 | 404 |
| `VALIDATION_ERROR` | 输入验证失败 | 400 |
| `API_ERROR` | 外部 API 调用失败 | 502 |
| `FFMPEG_ERROR` | 视频处理失败 | 500 |
| `TIMEOUT_ERROR` | 任务执行超时 | 504 |
| `INVALID_STATE` | 任务状态不支持当前操作 | 409 |

---

## 3. 核心功能模块

### 3.1 结构化输入模块

**功能**: 将用户零散想法转换为结构化数据

**表单字段**:
- **基础配置**: 风格、场景、年代、地域、文化元素
- **构图设置**: 视角、景别、光影风格
- **人物设置**: 年龄、性别、特征、动作、表情
- **氛围设置**: 情绪基调、色彩倾向
- **自由描述**: 补充文本

**模板库** (`lib/templates/`):
```typescript
interface Template {
  id: string;
  name: string;
  category: string;
  defaults: {
    style: string;
    scene: string;
    composition: string;
    lighting: string;
    era: string;
    region: string;
    culture: string[];
  };
  promptTemplate: string;  // 含占位符的提示词模板
}
```

### 3.2 提示词扩展服务

**功能**: 调用 DeepSeek API 将结构化输入扩展为详细提示词

**流程**:
1. 根据模板和用户选择生成基础提示词
2. 调用 DeepSeek API 进行扩展润色
3. 返回结构化的 AI 绘画提示词

**API 配置**:
- 服务商：硅基流动
- 模型：deepseek-v3.2
- 系统提示词：用户现有的 DeepSeek 提示词

### 3.3 即梦 API 客户端

**功能**: 与本地部署的 jimeng-free-api-all 服务通信

**接口**:
- `POST /v1/images/generations` - 文生图
- `POST /v1/videos/generations` - 图生视频
- `GET /v1/images/{id}` - 查询图片状态
- `GET /v1/videos/{id}` - 查询视频状态

**配置**:
- 基础 URL: `http://localhost:3000/v1`

### 3.4 视频处理服务

**功能**: 将用户提供的配乐合并到视频中

**实现**: 调用系统 FFmpeg

**命令**:
```bash
ffmpeg -i input_video.mp4 -i bgm.mp3 \
  -c:v copy -c:a aac -shortest \
  -pix_fmt yuv420p \
  output_video.mp4
```

**前置检查**:
- 验证 FFmpeg 已安装
- 验证配乐文件格式（MP3/WAV）
- 验证视频文件完整性

### 3.5 发布辅助生成

**功能**: 为视频号发布生成辅助内容

**生成内容**:
- 视频标题（10-20 字）
- 视频文案/描述（100-200 字）
- 推荐标签（5-10 个）

**实现**: 调用 DeepSeek API，基于视频内容和风格生成

### 3.6 文件存储优化

**存储结构** (按任务组织):
```
public/uploads/
├── {taskId}/
│   ├── images/           # 原始生成的图片
│   │   ├── 0.jpg
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   └── 3.jpg
│   ├── video.mp4         # 原始视频（无配乐）
│   ├── bgm.mp3           # 用户上传的配乐
│   └── final.mp4         # 最终合成视频
```

**优势**:
- 便于管理和清理（删除任务时级联删除文件夹）
- 避免文件名冲突
- 支持按任务归档

**清理策略**:
- 任务删除时自动删除对应文件夹
- 定期清理 30 天前已完成的任务文件（可选）
- 提供「导出」功能让用户下载备份

## 4. 数据流与工作流程

### 4.1 全自动模式

```
用户提交表单
    ↓
[1] 生成提示词 ──→ 保存到数据库 (状态: prompt_generated)
    ↓
[2] 文生图 ──────→ 保存图片 URL (状态: image_generated)
    ↓
[3] 图生视频 ────→ 保存视频 URL (状态: video_generated)
    ↓
[4] 合并配乐 ────→ 保存最终视频 (状态: completed)
    ↓
[5] 生成发布文案 → 返回所有结果
```

### 4.2 分步模式

```
用户提交表单
    ↓
[1] 生成提示词 ──→ 展示给用户确认/编辑
    ↓ (用户确认)
[2] 文生图 ──────→ 展示 4 张图片供选择
    ↓ (用户选择)
[3] 图生视频 ────→ 展示视频预览
    ↓ (用户确认)
[4] 合并配乐 ────→ 展示最终视频
    ↓ (用户确认)
[5] 生成发布文案 → 展示标题、文案、标签
```

### 4.3 全自动模式的配乐处理

**方案选择**:

| 方案 | 描述 | 适用场景 |
|------|------|----------|
| A | 全自动到视频生成后停止，配乐需手动处理 | 默认方案 |
| B | 支持设置「默认配乐」，全自动时自动合并 | 用户有固定 BGM |
| C | 全自动完成后自动进入配乐步骤 | 推荐 |

**推荐实现 (方案 C)**:
1. 全自动模式执行：提示词 → 图片 → 视频 → 发布文案
2. 视频生成后，任务状态设为 `video_generated`
3. UI 提示用户：「视频已生成，请添加配乐完成最终作品」
4. 用户可点击「添加配乐」进入分步模式的配乐步骤
5. 保留分步模式的灵活性，同时提供全自动的便利

### 4.4 任务状态管理

```typescript
interface VideoTask {
  id: string;
  status: TaskStatus;
  mode: 'auto' | 'step';
  userInput: StructuredInput;
  prompt?: string;
  images?: string[];        // 生成的图片列表
  selectedImage?: string;   // 用户选择的图片
  videoUrl?: string;
  finalVideoPath?: string;
  bgmPath?: string;
  publishContent?: PublishContent;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

type TaskStatus =
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
```

---

## 5. 页面结构

### 5.1 路由设计

| 路由 | 功能 | 说明 |
|------|------|------|
| `/` | 首页/仪表盘 | 历史任务列表、快速开始 |
| `/create` | 创建任务 | 结构化表单、模式选择 |
| `/task/[id]` | 任务详情 | 状态展示、分步操作界面 |
| `/templates` | 模板管理 | 浏览、创建、编辑模板 |
| `/settings` | 设置 | API 配置、系统设置 |

### 5.2 关键组件

**表单组件** (`components/forms/`):
- `TemplateSelector` - 模板选择器（卡片式展示）
- `StyleSelector` - 风格选择（图标 + 文字）
- `RegionSelector` - 地域选择（下拉 + 搜索）
- `PromptEditor` - 提示词编辑器（带语法高亮）

**工作流组件** (`components/workflow/`):
- `StepIndicator` - 步骤指示器
- `ImageGallery` - 图片选择画廊（支持多选对比）
- `VideoPlayer` - 视频预览（带播放控制）
- `PublishPreview` - 发布内容预览（一键复制）
- `ProgressBar` - 进度条（全自动模式）

---

## 6. UI/UX 设计规范

### 6.1 设计理念

**「言画」** 的 UI 设计遵循以下原则：

- **简洁优雅**: 界面清爽，减少视觉噪音，让用户专注于创作
- **流程导向**: 清晰的工作流指引，让用户知道当前在哪一步
- **即时反馈**: 操作后立刻给出反馈，减少焦虑感
- **治愈美学**: 呼应产品主题，使用温暖柔和的配色

### 6.2 色彩系统

```css
/* 主色调 */
--primary-900: #1a1a1a;      /* 主要文字、按钮 */
--primary-700: #404040;      /* 次要文字 */
--primary-500: #737373;      /* 辅助文字 */
--primary-300: #d4d4d4;      /* 边框、分隔线 */
--primary-100: #f5f5f5;      /* 背景色 */
--primary-50:  #fafafa;      /* 浅背景 */

/* 强调色 - 温暖治愈 */
--accent-warm: #f5f0e8;      /* 温暖米色，卡片背景 */
--accent-rose: #e8d5d0;      /* 玫瑰灰，选中状态 */
--accent-gold: #d4a574;      /* 金色，高亮、标签 */

/* 状态色 */
--status-success: #22c55e;   /* 成功 */
--status-warning: #f59e0b;   /* 警告 */
--status-error: #ef4444;     /* 错误 */
--status-info: #3b82f6;      /* 信息 */

/* 背景层次 */
--bg-page: #fafafa;          /* 页面背景 */
--bg-card: #ffffff;          /* 卡片背景 */
--bg-elevated: #f5f0e8;      /* 悬浮背景 */
```

**使用规范**:
- 页面背景使用 `--bg-page` (浅灰)
- 卡片使用 `--bg-card` (纯白) + 轻微阴影
- 选中/激活状态使用 `--accent-warm` 或 `--accent-rose`
- 主要按钮使用 `--primary-900` (深灰黑)
- 状态标签使用对应状态色 + 10% 透明度背景

### 6.3 字体系统

```css
/* 字体栈 */
font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;

/* 字号规范 */
--text-xs: 0.75rem;     /* 12px - 标签、辅助文字 */
--text-sm: 0.875rem;    /* 14px - 正文、按钮 */
--text-base: 1rem;      /* 16px - 重要正文 */
--text-lg: 1.125rem;    /* 18px - 小标题 */
--text-xl: 1.25rem;     /* 20px - 卡片标题 */
--text-2xl: 1.5rem;     /* 24px - 页面标题 */
--text-3xl: 1.875rem;   /* 30px - 大标题 */

/* 字重 */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* 行高 */
--leading-tight: 1.25;   /* 标题 */
--leading-normal: 1.5;   /* 正文 */
--leading-relaxed: 1.75; /* 大段文字 */
```

### 6.4 布局规范

**页面结构**:
```
┌─────────────────────────────────────────┐
│  Header (固定高度 64px)                  │
├─────────────────────────────────────────┤
│                                         │
│  Main Content                           │
│  - max-width: 1200px                    │
│  - padding: 24px (桌面) / 16px (移动)   │
│                                         │
├─────────────────────────────────────────┤
│  Footer (可选)                          │
└─────────────────────────────────────────┘
```

**间距系统** (8px 基准):
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px

**卡片规范**:
- 圆角: 12px (border-radius: 0.75rem)
- 阴影: `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)`
- 悬浮阴影: `0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)`
- 内边距: 24px

### 6.5 组件规范

#### 6.5.1 按钮 (Button)

**主要按钮 (Primary)**:
- 背景: `--primary-900`
- 文字: 白色
- 圆角: 8px
- 高度: 40px (标准) / 48px (大)
- 内边距: 16px 24px
- 悬浮: 背景变浅 `--primary-700`

**次要按钮 (Secondary)**:
- 背景: 白色
- 边框: 1px solid `--primary-300`
- 文字: `--primary-900`
- 悬浮: 背景 `--primary-50`

**幽灵按钮 (Ghost)**:
- 背景: 透明
- 文字: `--primary-700`
- 悬浮: 背景 `--primary-100`

#### 6.5.2 卡片 (Card)

**模板卡片**:
- 宽度: 自适应，最小 280px
- 图片区域: 16:9 比例
- 选中状态: 2px solid `--primary-900`
- 标签: 小圆角药丸形状

**任务卡片**:
- 左侧状态指示条: 4px 宽
- 不同状态对应不同颜色
- 操作按钮右下角对齐

#### 6.5.3 表单组件

**选项标签 (Chip/Tag)**:
- 默认: 灰色背景，圆角 6px
- 选中: 深色背景，白色文字
- 多选支持

**文本输入框**:
- 边框: 1px solid `--primary-300`
- 圆角: 8px
- 聚焦: 边框 `--primary-900`，阴影
- 最小高度: 40px

**文本域**:
- 最小高度: 100px
- 可拖拽调整大小

#### 6.5.4 步骤指示器

- 步骤圆点: 32px 直径
- 完成: 绿色背景 + 勾选图标
- 当前: 深色背景 + 白色数字
- 待办: 灰色边框 + 灰色数字
- 连接线: 2px 高，完成绿色，待办灰色

### 6.6 页面详细设计

#### 6.6.1 首页 / 仪表盘

**布局**:
```
┌──────────────────────────────────────────┐
│  仪表盘                    [+ 新建创作]   │
│  管理和查看您的视频创作任务               │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ [状态条] 治愈系 · 现代家居        │   │
│  │ 2024-03-23 14:30                 │   │
│  │ 风格: 治愈系 · 地域: 岭南        │   │
│  │                      [查看详情]   │   │
│  └──────────────────────────────────┘   │
│                                          │
│  [更多任务卡片...]                       │
│                                          │
└──────────────────────────────────────────┘
```

**空状态**:
- 居中插画 (简约线条风格)
- 引导文案: "还没有创建任何任务"
- 明显的 CTA 按钮: "开始第一个创作"

#### 6.6.2 创建任务页

**布局** (三栏):
```
┌──────────────────────────────────────────┐
│  新建创作                                 │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────┐                     │
│  │ 执行模式        │                     │
│  │ ○ 分步  ○ 全自动│                     │
│  └────────────────┘                     │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 选择模板                          │   │
│  │ ┌────┐ ┌────┐ ┌────┐            │   │
│  │ │ 图 │ │ 图 │ │ 图 │            │   │
│  │ │温馨│ │ 90 │ │江南│            │   │
│  │ │家居│ │年代│ │水乡│            │   │
│  │ └────┘ └────┘ └────┘            │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 详细配置                          │   │
│  │ 风格: [治愈][复古][极简]...       │   │
│  │ 场景: [家居][江南][田园]...       │   │
│  │ ...                               │   │
│  └──────────────────────────────────┘   │
│                                          │
│                    [开始创作]            │
│                                          │
└──────────────────────────────────────────┘
```

**交互细节**:
- 选择模板后，下方配置自动填充
- 配置项支持「自定义」输入
- 表单验证实时反馈
- 提交后跳转至任务详情页

#### 6.6.3 任务详情页 (分步模式)

**布局**:
```
┌──────────────────────────────────────────┐
│  创作任务                    模式: 分步   │
│  创建于 2024-03-23                       │
├──────────────────────────────────────────┤
│  ●─────●─────○─────○─────○               │
│ 提示词  图片   视频  配乐  发布            │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 当前步骤: 生成提示词              │   │
│  │                                   │   │
│  │ [文本域显示 AI 生成的提示词]      │   │
│  │                                   │   │
│  │              [重新生成] [下一步]  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 历史步骤                          │   │
│  │ ✓ 提示词已生成 (可展开查看)       │   │
│  └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

**各步骤详情**:

*步骤 2 - 图片选择*:
- 2x2 网格展示 4 张生成的图片
- 悬停显示放大预览
- 点击选中，边框高亮
- 选中后显示「下一步」按钮

**图片预览增强功能**:
- **点击放大**: Lightbox 模式查看原图
- **对比模式**: 支持选择两张图片并排对比
- **键盘导航**: 左右箭头切换，Esc 关闭预览
- **图片信息**: 显示尺寸、生成参数等元数据

*步骤 3 - 视频预览*:
- 居中视频播放器
- 播放/暂停/全屏控制
- 下方显示视频信息 (时长、尺寸)
- 「重新生成」「下一步」按钮

*步骤 4 - 合并配乐*:
- 视频预览 (静音)
- 音频上传区域 (支持拖拽)
- 已上传音频显示文件名和时长
- 「合并并生成」按钮，显示进度

*步骤 5 - 发布内容*:
- 三栏展示: 标题 / 文案 / 标签
- 每项带复制按钮
- 「复制全部」按钮
- 可编辑模式切换

#### 6.6.4 全自动模式界面

**简化视图**:
- 大型进度指示器 (圆形或线性)
- 当前步骤文字说明
- 实时日志展开/收起
- 取消任务按钮
- 完成后展示结果卡片

#### 6.6.5 模板管理页

**布局**:
- 顶部: 分类筛选标签
- 主体: 网格布局展示模板
- 每个模板卡片包含:
  - 预览图 (生成的示例图或占位图)
  - 模板名称
  - 标签分类
  - 「使用」按钮
  - 「预览效果」按钮

### 6.7 交互动效

**过渡动画**:
- 页面切换: 淡入淡出 200ms
- 卡片悬浮: 上移 2px + 阴影增强 200ms
- 按钮点击: 缩放 0.98 100ms
- 步骤切换: 滑动 + 淡入 300ms

**加载状态**:
- 按钮加载: Spinner + "生成中..."
- 卡片加载: Skeleton 骨架屏
- 进度显示: 线性进度条或百分比

**反馈动效**:
- 操作成功: 轻微弹跳 + 绿色勾选
- 操作失败: 抖动 + 红色提示
- 复制成功: Tooltip "已复制"

### 6.10 加载状态细化

区分不同类型的加载状态，提供更精确的反馈：

| 步骤 | 加载文案 | 预计时间 |
|------|----------|----------|
| 提示词扩展 | "AI 正在构思画面..." | 5-10s |
| 文生图 | "AI 正在作画..." | 30-60s |
| 图生视频 | "AI 正在渲染动画..." | 60-120s |
| FFmpeg 合并 | "正在合成音视频..." | 5-15s |
| 发布文案 | "正在撰写文案..." | 3-5s |

**加载 UI 组件**:
- 进度条 + 百分比显示（支持实时更新）
- 步骤文字说明当前进行到哪一步
- 取消按钮（支持中断长时间操作）
- 预计剩余时间估算

### 6.11 键盘快捷键

提升效率的快捷键支持：

| 快捷键 | 功能 | 适用页面 |
|--------|------|----------|
| `Cmd/Ctrl + N` | 新建创作 | 全局 |
| `Space` | 播放/暂停视频 | 任务详情页 |
| `→` / `←` | 切换步骤 | 任务详情页 |
| `↑` / `↓` | 选择图片 | 图片选择步骤 |
| `Enter` | 确认当前步骤 | 任务详情页 |
| `Esc` | 关闭弹窗/取消操作 | 全局 |
| `Cmd/Ctrl + C` | 复制选中内容 | 发布内容步骤 |
| `R` | 重新生成当前步骤 | 任务详情页 |

**快捷键提示**:
- 按钮 tooltip 显示对应快捷键
- 首次使用时显示快捷键引导
- 设置页提供快捷键列表参考

**断点**:
- Desktop: >= 1024px
- Tablet: 768px - 1023px
- Mobile: < 768px

**适配规则**:
- 导航栏: Desktop 横向 / Mobile 汉堡菜单
- 模板网格: Desktop 3列 / Tablet 2列 / Mobile 1列
- 图片选择: Desktop 2x2 / Mobile 1列滚动
- 步骤指示器: Mobile 垂直堆叠
- 表单: Mobile 全宽，减少内边距

### 6.9 图标系统

使用 **Lucide React** 图标库，主要图标：

| 功能 | 图标 |
|------|------|
| 新建 | `Plus` |
| 编辑 | `Pencil` |
| 删除 | `Trash2` |
| 复制 | `Copy` |
| 播放 | `Play` |
| 暂停 | `Pause` |
| 全屏 | `Maximize2` |
| 下载 | `Download` |
| 刷新 | `RefreshCw` |
| 设置 | `Settings` |
| 成功 | `CheckCircle` |
| 错误 | `XCircle` |
| 警告 | `AlertCircle` |
| 信息 | `Info` |
| 上一步 | `ChevronLeft` |
| 下一步 | `ChevronRight` |
| 展开 | `ChevronDown` |
| 收起 | `ChevronUp` |

---

## 8. 错误处理

### 8.1 任务持久化与恢复

**问题**: 内存队列在应用重启时会丢失进行中的任务状态。

**解决方案**:

1. **任务超时检测**
```typescript
// 定时检查超时任务
async function checkStaleTasks() {
  const staleThreshold = 15 * 60 * 1000; // 15 分钟
  const staleTasks = await prisma.task.findMany({
    where: {
      status: {
        in: ['prompt_generating', 'image_generating', 'video_generating', 'merging']
      },
      updatedAt: {
        lt: new Date(Date.now() - staleThreshold)
      }
    }
  });

  for (const task of staleTasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'error',
        errorMessage: 'Task timed out - please retry this step'
      }
    });
  }
}
```

2. **步骤级重试机制**
   - 每个步骤独立记录状态
   - 支持从失败的步骤重新执行
   - 保留已完成步骤的结果

### 8.2 错误类型

| 错误类型 | 触发场景 | 处理策略 |
|----------|----------|----------|
| API_ERROR | DeepSeek/jimeng 返回错误 | 重试 3 次 → 暂停待用户 |
| NETWORK_ERROR | 网络连接中断 | 指数退避重试 |
| FILE_ERROR | 文件读写失败 | 清理临时文件，记录日志 |
| FFMPEG_ERROR | 视频处理错误 | 检查 FFmpeg，友好提示 |
| VALIDATION_ERROR | 用户输入不合法 | 即时反馈，阻止提交 |
| TIMEOUT_ERROR | 任务超时（>10min） | 标记失败，允许重试 |

### 8.3 错误恢复机制

```typescript
// 重试策略
const retryConfig = {
  maxRetries: 3,
  backoff: 'exponential',  // 指数退避
  initialDelay: 1000,      // 1 秒
  maxDelay: 30000,         // 30 秒
};

// 用户通知
- 全自动模式: Toast 通知 + 任务列表状态更新
- 分步模式: 当前步骤内显示错误详情
```

---

## 9. 配置文件

### 7.1 应用配置 (`config/app.config.ts`)

```typescript
export const config = {
  deepseek: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-v3.2',
    maxTokens: 2000,
  },

  jimeng: {
    baseUrl: process.env.JIMENG_API_URL || 'http://localhost:3000/v1',
    timeout: 120000,  // 2 分钟
  },

  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
    videoCodec: 'copy',
    audioCodec: 'aac',
  },

  storage: {
    uploadDir: './public/uploads',
    maxFileSize: 50 * 1024 * 1024,  // 50MB
    allowedAudioTypes: ['audio/mpeg', 'audio/wav'],
  },

  task: {
    timeout: 10 * 60 * 1000,  // 10 分钟
    maxRetries: 3,
    cleanupInterval: 24 * 60 * 60 * 1000,  // 24 小时清理旧文件
  }
};
```

### 7.2 环境变量 (`.env.local`)

```bash
# 必需
DEEPSEEK_API_KEY=your_siliconflow_api_key

# 可选（有默认值）
FFMPEG_PATH=/usr/local/bin/ffmpeg
JIMENG_API_URL=http://localhost:3000/v1
DATABASE_URL=file:./yanhua.db
UPLOAD_DIR=./public/uploads
```

---

## 10. 数据模型

### 10.1 Prisma Schema（当前方案）

使用 JSON 字符串存储数组字段：

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
  id          String   @id @default(uuid())
  name        String
  category    String
  description String?
  defaults    String   // JSON
  promptTemplate String
  isBuiltin   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 10.2 替代方案：规范化图片存储

**适用场景**: 需要支持按图片查询任务、图片级元数据或图片评分时

```prisma
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
  images          TaskImage[]  // 关系字段替代 JSON
  selectedImageId String?
  videoUrl        String?
  finalVideoPath  String?
  bgmPath         String?

  // 发布内容
  title           String?
  content         String?
  tags            Tag[]        // 关系字段替代 JSON

  // 元数据
  errorMessage    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model TaskImage {
  id          String  @id @default(uuid())
  taskId      String
  url         String
  order       Int     // 排序 0-3
  isSelected  Boolean @default(false)
  metadata    String? // JSON: 尺寸、生成参数等
  rating      Int?    // 用户评分 1-5
  task        Task    @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
}

model Tag {
  id     String @id @default(uuid())
  taskId String
  name   String // 不带 # 的标签名
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
}
```

**对比**:

| 特性 | JSON 方案 (当前) | 规范化方案 |
|------|------------------|------------|
| 实现复杂度 | 简单 | 较复杂 |
| 查询灵活性 | 受限 | 高 |
| 图片元数据 | 不支持 | 支持 |
| 性能 | 较好 | 多表查询 |
| 扩展性 | 一般 | 好 |

**建议**: 初期使用 JSON 方案快速迭代，需要图片分析功能时迁移到规范化方案。

---

## 11. 内置模板示例

### 11.1 治愈系家居模板

```typescript
{
  id: 'cozy-home',
  name: '温馨家居',
  category: '家居',
  description: '治愈系现代家居场景',
  defaults: {
    style: '治愈系',
    scene: '现代家居',
    composition: '广角全景',
    lighting: '电影感光影',
    era: '现代',
    region: '岭南',
    culture: ['广府元素', '生活气息', '岭南建筑']
  },
  promptTemplate: `
{{style}}风格，{{scene}}场景，{{lighting}}。
{{composition}}构图，{{era}}年代，{{region}}地域特色。
{{culture}}文化元素，细节极其丰富，充满生活气息。
女主角是个漂亮的{{region}}女人，20 多岁，动作自然不刻意摆拍。
{{description}}

色调温暖柔和，画面质感细腻，
就像电视剧和电影一样，经过精心艺术加工但真实自然，
让人产生向往的感觉，想要生活在里面。
  `.trim()
}
```

### 11.2 其他预设模板

- `nostalgic-90s` - 90 年代怀旧风
- `jiangnan-water` - 江南水乡
- `modern-minimal` - 现代极简
- `rustic-country` - 田园 rustic

---

## 12. 部署要求

### 10.1 前置条件

1. **Node.js**: >= 18.x
2. **FFmpeg**: 已安装并加入 PATH
3. **jimeng-free-api-all**: 本地运行，端口 3000

### 10.2 启动步骤

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY

# 3. 初始化数据库
npx prisma migrate dev

# 4. 启动开发服务器
npm run dev
```

### 10.3 文件清理策略

**自动清理规则**:
1. **任务删除时**: 级联删除 `public/uploads/{taskId}/` 文件夹
2. **定时清理**: 可选配置，删除 30 天前已完成的任务文件
3. **空间阈值**: 当磁盘空间不足时，优先清理最早的已完成任务

**用户控制**:
- 提供「导出」按钮，允许用户下载最终视频备份
- 设置页显示存储使用情况
- 手动清理历史任务

### 10.4 并发限制与队列

**jimeng-free-api-all 并发**:
- 默认建议串行执行（单任务队列）
- 如需并发，建议最大 2-3 个任务同时执行
- 在任务管理器中添加并发控制

**实现方案**:
```typescript
// 简单的内存队列
class TaskQueue {
  private queue: string[] = [];
  private running: Set<string> = new Set();
  private maxConcurrency: number = 2;

  async add(taskId: string, fn: () => Promise<void>) {
    if (this.running.size >= this.maxConcurrency) {
      await this.waitForSlot();
    }
    this.running.add(taskId);
    try {
      await fn();
    } finally {
      this.running.delete(taskId);
    }
  }

  private waitForSlot(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.running.size < this.maxConcurrency) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      };
      check();
    });
  }
}
```

### 10.5 视频格式处理

**即梦输出格式**: 通常为 MP4 (H.264)

**FFmpeg 转码配置** (如需兼容更多设备):
```typescript
ffmpeg: {
  path: process.env.FFMPEG_PATH || 'ffmpeg',
  // 如需转码而非直接复制
  videoCodec: 'libx264',  // H.264 编码
  audioCodec: 'aac',
  additionalOptions: [
    '-pix_fmt', 'yuv420p',  // 兼容旧设备
    '-preset', 'fast',      // 编码速度
    '-crf', '23',           // 质量 (0-51, 越低越好)
  ]
}
```

**建议**: 默认使用 `-c:v copy` 保持原质量，遇到兼容性问题时再启用转码。

### 10.6 生产部署

```bash
# 构建
npm run build

# 启动
npm start
```

---

## 13. 后续优化方向

1. **队列系统**: 使用 BullMQ 替代内存队列，支持任务持久化
2. **多用户支持**: 添加用户认证，支持多创作者
3. **批量生成**: 一次提交多个变体，对比选择
4. **历史回溯**: 支持从任意步骤重新开始
5. **AI 配音**: 集成 TTS 生成旁白
6. **云存储**: 支持 OSS/S3 存储大文件

---

## 14. 附录

### 14.1 术语表

- **yanhua**: 项目名称，取自 "言画"，一言一画，语言即画面。
- **jimeng-free-api-all**: 第三方开源项目，将即梦 Web 应用封装为 API
- **硅基流动**: 提供 DeepSeek API 服务的云厂商

### 14.2 参考资料

- [jimeng-free-api-all](https://github.com/zhizinan1997/jimeng-free-api-all)
- [硅基流动文档](https://docs.siliconflow.cn/)
- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)

---

**审核记录**:

| 版本 | 日期 | 审核人 | 状态 |
|------|------|--------|------|
| v1.0 | 2026-03-23 | - | 待审核 |
