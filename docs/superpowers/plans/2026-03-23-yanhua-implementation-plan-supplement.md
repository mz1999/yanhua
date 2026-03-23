# 言画视频创作自动化系统 - 实施计划补充

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补充实现设计文档中新增的 8 项功能：API 响应规范、文件存储优化、全自动配乐处理、加载状态细化、键盘快捷键、图片预览增强、任务持久化恢复、并发队列控制

**Architecture:** 基于已实现的 Next.js 全栈架构，增量添加功能模块

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Prisma, SQLite

---

## 补充任务概览

| 任务 | 功能 | 依赖 |
|------|------|------|
| Task S1 | API 响应格式规范化 | Task 1-3 |
| Task S2 | 文件存储优化（按任务组织） | Task 7 |
| Task S3 | 任务队列与并发控制 | Task 9 |
| Task S4 | 任务超时检测与恢复 | Task 2 |
| Task S5 | 加载状态细化组件 | Task 11 |
| Task S6 | 键盘快捷键支持 | Task 11-14 |
| Task S7 | 图片 Lightbox 预览 | Task 14 |
| Task S8 | 全自动模式配乐引导 | Task 16 |

---

## Task S1: API 响应格式规范化

**Files:**
- Create: `src/lib/api-response.ts`
- Modify: `src/app/api/tasks/route.ts`
- Modify: `src/app/api/tasks/[id]/route.ts`
- Modify: `src/app/api/tasks/[id]/generate-prompt/route.ts`
- Modify: `src/app/api/tasks/[id]/generate-image/route.ts`
- Modify: `src/app/api/tasks/[id]/generate-video/route.ts`
- Modify: `src/app/api/tasks/[id]/merge-audio/route.ts`
- Modify: `src/app/api/tasks/[id]/generate-publish/route.ts`

- [ ] **Step 1: 创建 API 响应工具函数**

```typescript
// src/lib/api-response.ts
import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 错误代码枚举
export const ErrorCode = {
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  API_ERROR: 'API_ERROR',
  FFMPEG_ERROR: 'FFMPEG_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  INVALID_STATE: 'INVALID_STATE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  FILE_ERROR: 'FILE_ERROR',
} as const;

export function successResponse<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

// 常用错误响应快捷方式
export const errors = {
  taskNotFound: () => errorResponse(ErrorCode.TASK_NOT_FOUND, '任务不存在', 404),
  validationError: (message: string) => errorResponse(ErrorCode.VALIDATION_ERROR, message, 400),
  apiError: (message: string) => errorResponse(ErrorCode.API_ERROR, message, 502),
  ffmpegError: (message: string) => errorResponse(ErrorCode.FFMPEG_ERROR, message, 500),
  timeoutError: () => errorResponse(ErrorCode.TIMEOUT_ERROR, '任务执行超时', 504),
  invalidState: (message: string) => errorResponse(ErrorCode.INVALID_STATE, message, 409),
};
```

- [ ] **Step 2: 更新任务列表 API**

修改 `src/app/api/tasks/route.ts`：
```typescript
import { successResponse, errorResponse, ErrorCode } from '@/lib/api-response';

// GET 成功时
return successResponse({ tasks, pagination: { total, limit, offset } });

// 错误时
return errorResponse(ErrorCode.API_ERROR, '获取任务列表失败', 500);
```

- [ ] **Step 3: 更新所有 API 路由**

按照相同模式更新所有 API 路由，统一返回格式。

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: standardize API response format with error codes"
```

---

## Task S2: 文件存储优化（按任务组织）

**Files:**
- Modify: `src/lib/services/video-processor.ts`
- Modify: `src/lib/services/jimeng-client.ts`
- Modify: `src/app/api/tasks/[id]/merge-audio/route.ts`
- Create: `src/lib/file-storage.ts`

- [ ] **Step 1: 创建文件存储工具模块**

```typescript
// src/lib/file-storage.ts
import fs from 'fs/promises';
import path from 'path';
import { config } from './config';

const UPLOAD_BASE = config.storage.uploadDir;

export function getTaskDir(taskId: string): string {
  return path.join(UPLOAD_BASE, taskId);
}

export function getTaskImagesDir(taskId: string): string {
  return path.join(getTaskDir(taskId), 'images');
}

export async function ensureTaskDir(taskId: string): Promise<void> {
  const dir = getTaskDir(taskId);
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(getTaskImagesDir(taskId), { recursive: true });
}

export async function saveTaskImage(
  taskId: string,
  index: number,
  imageBuffer: Buffer
): Promise<string> {
  const imagesDir = getTaskImagesDir(taskId);
  const filename = `${index}.jpg`;
  const filepath = path.join(imagesDir, filename);
  await fs.writeFile(filepath, imageBuffer);
  return `/uploads/${taskId}/images/${filename}`;
}

export async function saveTaskVideo(
  taskId: string,
  videoBuffer: Buffer
): Promise<string> {
  const taskDir = getTaskDir(taskId);
  const filename = 'video.mp4';
  const filepath = path.join(taskDir, filename);
  await fs.writeFile(filepath, videoBuffer);
  return `/uploads/${taskId}/${filename}`;
}

export async function saveTaskAudio(
  taskId: string,
  audioBuffer: Buffer,
  ext: string = 'mp3'
): Promise<string> {
  const taskDir = getTaskDir(taskId);
  const filename = `bgm.${ext}`;
  const filepath = path.join(taskDir, filename);
  await fs.writeFile(filepath, audioBuffer);
  return filepath;
}

export async function saveFinalVideo(
  taskId: string,
  videoBuffer: Buffer
): Promise<string> {
  const taskDir = getTaskDir(taskId);
  const filename = 'final.mp4';
  const filepath = path.join(taskDir, filename);
  await fs.writeFile(filepath, videoBuffer);
  return filepath;
}

export async function deleteTaskFiles(taskId: string): Promise<void> {
  const taskDir = getTaskDir(taskId);
  try {
    await fs.rm(taskDir, { recursive: true, force: true });
  } catch {
    // 目录可能不存在，忽略错误
  }
}

export async function getTaskStorageSize(taskId: string): Promise<number> {
  const taskDir = getTaskDir(taskId);
  try {
    const files = await fs.readdir(taskDir, { recursive: true });
    let totalSize = 0;
    for (const file of files) {
      const stat = await fs.stat(path.join(taskDir, file));
      if (stat.isFile()) {
        totalSize += stat.size;
      }
    }
    return totalSize;
  } catch {
    return 0;
  }
}
```

- [ ] **Step 2: 更新视频处理服务使用新存储结构**

修改 `src/lib/services/video-processor.ts`：
```typescript
import { ensureTaskDir, saveFinalVideo } from '@/lib/file-storage';

export async function mergeAudioWithVideo(
  taskId: string,
  videoUrl: string,
  bgmPath: string
): Promise<string> {
  await ensureTaskDir(taskId);
  // ... 合并逻辑
  const outputPath = await saveFinalVideo(taskId, mergedBuffer);
  return outputPath;
}
```

- [ ] **Step 3: 更新 jimeng 客户端下载和保存图片**

- [ ] **Step 4: 添加任务删除时级联删除文件**

在删除任务的 API 中调用 `deleteTaskFiles`。

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat: optimize file storage with task-based directory structure"
```

---

## Task S3: 任务队列与并发控制

**Files:**
- Create: `src/lib/task-queue.ts`
- Modify: `src/lib/services/jimeng-client.ts`
- Modify: `src/app/api/tasks/[id]/auto-run/route.ts`

- [ ] **Step 1: 创建任务队列**

```typescript
// src/lib/task-queue.ts
import { EventEmitter } from 'events';

interface QueuedTask {
  taskId: string;
  fn: () => Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
}

class TaskQueue extends EventEmitter {
  private queue: QueuedTask[] = [];
  private running: Set<string> = new Set();
  private maxConcurrency: number;

  constructor(maxConcurrency: number = 2) {
    super();
    this.maxConcurrency = maxConcurrency;
  }

  async add(taskId: string, fn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskId, fn, resolve, reject });
      this.emit('queued', taskId);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running.size >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const queued = this.queue.shift();
    if (!queued) return;

    const { taskId, fn, resolve, reject } = queued;
    this.running.add(taskId);
    this.emit('started', taskId);

    try {
      await fn();
      resolve();
      this.emit('completed', taskId);
    } catch (error) {
      reject(error as Error);
      this.emit('failed', taskId, error);
    } finally {
      this.running.delete(taskId);
      // 继续处理队列中的下一个任务
      setImmediate(() => this.processQueue());
    }
  }

  getRunningCount(): number {
    return this.running.size;
  }

  getQueuedCount(): number {
    return this.queue.length;
  }

  isRunning(taskId: string): boolean {
    return this.running.has(taskId);
  }
}

// 全局队列实例
export const globalTaskQueue = new TaskQueue(2);
```

- [ ] **Step 2: 在 jimeng 客户端使用队列**

```typescript
import { globalTaskQueue } from '@/lib/task-queue';

export async function generateImagesWithQueue(
  taskId: string,
  prompt: string,
  n: number = 4
): Promise<string[]> {
  return globalTaskQueue.add(taskId, async () => {
    return generateImages(prompt, n);
  });
}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add task queue with concurrency control"
```

---

## Task S4: 任务超时检测与恢复

**Files:**
- Create: `src/lib/task-monitor.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/api/tasks/[id]/route.ts`

- [ ] **Step 1: 创建任务监控模块**

```typescript
// src/lib/task-monitor.ts
import { prisma } from './db';

const STALE_THRESHOLD = 15 * 60 * 1000; // 15 分钟

export async function checkStaleTasks(): Promise<number> {
  const staleThreshold = new Date(Date.now() - STALE_THRESHOLD);

  const staleTasks = await prisma.task.findMany({
    where: {
      status: {
        in: ['prompt_generating', 'image_generating', 'video_generating', 'merging'],
      },
      updatedAt: {
        lt: staleThreshold,
      },
    },
  });

  for (const task of staleTasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'error',
        errorMessage: `任务执行超时 (${task.status})，请重新尝试此步骤`,
      },
    });
  }

  return staleTasks.length;
}

// 启动定时检查
export function startTaskMonitor(intervalMs: number = 5 * 60 * 1000): void {
  console.log('Starting task monitor...');
  setInterval(async () => {
    const count = await checkStaleTasks();
    if (count > 0) {
      console.log(`Marked ${count} stale tasks as error`);
    }
  }, intervalMs);
}
```

- [ ] **Step 2: 在应用启动时启动监控**

修改 `src/app/layout.tsx`，在服务端启动监控：
```typescript
import { startTaskMonitor } from '@/lib/task-monitor';

if (typeof window === 'undefined') {
  startTaskMonitor();
}
```

- [ ] **Step 3: 添加任务重试 API**

创建 `src/app/api/tasks/[id]/retry/route.ts`：
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errors } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = await prisma.task.findUnique({
    where: { id: params.id },
  });

  if (!task) {
    return errors.taskNotFound();
  }

  // 只允许重试错误状态的任务
  if (task.status !== 'error') {
    return errors.invalidState('只有出错状态的任务可以重试');
  }

  // 重置状态到失败前的状态
  const lastSuccessfulStatus = getLastSuccessfulStatus(task);

  const updatedTask = await prisma.task.update({
    where: { id: params.id },
    data: {
      status: lastSuccessfulStatus,
      errorMessage: null,
    },
  });

  return successResponse({ task: updatedTask });
}

function getLastSuccessfulStatus(task: any): string {
  // 根据已有输出推断最后成功的状态
  if (task.finalVideoPath) return 'video_generated';
  if (task.videoUrl) return 'video_generated';
  if (task.selectedImage) return 'image_generated';
  if (task.images) return 'image_generated';
  if (task.prompt) return 'prompt_generated';
  return 'pending';
}
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add task monitoring with stale detection and retry support"
```

---

## Task S5: 加载状态细化组件

**Files:**
- Create: `src/components/ui/loading-state.tsx`
- Create: `src/components/workflow/ProgressIndicator.tsx`
- Modify: `src/app/task/[id]/page.tsx`

- [ ] **Step 1: 创建细化加载状态组件**

```typescript
// src/components/ui/loading-state.tsx
'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  step: 'prompt' | 'image' | 'video' | 'merge' | 'publish';
  progress?: number; // 0-100
  showProgress?: boolean;
}

const loadingConfig = {
  prompt: {
    text: 'AI 正在构思画面...',
    subtext: '预计 5-10 秒',
    estimatedTime: 10,
  },
  image: {
    text: 'AI 正在作画...',
    subtext: '预计 30-60 秒',
    estimatedTime: 60,
  },
  video: {
    text: 'AI 正在渲染动画...',
    subtext: '预计 60-120 秒',
    estimatedTime: 120,
  },
  merge: {
    text: '正在合成音视频...',
    subtext: '预计 5-15 秒',
    estimatedTime: 15,
  },
  publish: {
    text: '正在撰写文案...',
    subtext: '预计 3-5 秒',
    estimatedTime: 5,
  },
};

export function LoadingState({ step, progress, showProgress = true }: LoadingStateProps) {
  const config = loadingConfig[step];

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">{config.text}</p>
        <p className="text-sm text-gray-500 mt-1">{config.subtext}</p>
      </div>
      {showProgress && progress !== undefined && (
        <div className="w-64 space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">{progress}%</p>
        </div>
      )}
    </div>
  );
}

// 带取消按钮的加载状态
interface CancellableLoadingStateProps extends LoadingStateProps {
  onCancel: () => void;
}

export function CancellableLoadingState({
  onCancel,
  ...props
}: CancellableLoadingStateProps) {
  return (
    <div className="space-y-4">
      <LoadingState {...props} />
      <button
        onClick={onCancel}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        取消操作
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 创建进度指示器组件**

```typescript
// src/components/workflow/ProgressIndicator.tsx
'use client';

import { Check, Loader2 } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: string;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            {step.status === 'completed' && (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {step.status === 'running' && (
              <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
            )}
            {step.status === 'pending' && (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            {step.status === 'error' && (
              <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">
                !
              </div>
            )}
          </div>
          <span
            className={`text-sm ${
              step.status === 'running'
                ? 'text-gray-900 font-medium'
                : step.status === 'completed'
                ? 'text-gray-600'
                : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
          {step.id === currentStep && step.status === 'running' && (
            <span className="text-xs text-gray-400">进行中...</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 在任务详情页使用新组件**

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add detailed loading states with progress indicators"
```

---

## Task S6: 键盘快捷键支持

**Files:**
- Create: `src/hooks/use-keyboard-shortcuts.ts`
- Create: `src/components/KeyboardShortcutsHelp.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 创建键盘快捷键 Hook**

```typescript
// src/hooks/use-keyboard-shortcuts.ts
'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(configs: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const config of configs) {
        const keyMatch = event.key.toLowerCase() === config.key.toLowerCase();
        const ctrlMatch = config.ctrl ? event.ctrlKey : !event.ctrlKey;
        const metaMatch = config.meta ? event.metaKey : !event.metaKey;
        const shiftMatch = config.shift ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
          event.preventDefault();
          config.handler();
          break;
        }
      }
    },
    [configs]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// 全局快捷键
export function useGlobalShortcuts() {
  const router = useRouter();

  useKeyboardShortcuts([
    {
      key: 'n',
      meta: true,
      handler: () => router.push('/create'),
      description: '新建创作',
    },
    {
      key: 'Escape',
      handler: () => {
        // 关闭弹窗或返回上一页
        if (window.history.length > 1) {
          router.back();
        }
      },
      description: '返回/关闭',
    },
  ]);
}

// 任务详情页快捷键
export function useTaskDetailShortcuts({
  onPlayPause,
  onNextStep,
  onPrevStep,
  onConfirm,
  onRegenerate,
}: {
  onPlayPause?: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onConfirm?: () => void;
  onRegenerate?: () => void;
}) {
  useKeyboardShortcuts([
    {
      key: ' ',
      handler: () => onPlayPause?.(),
      description: '播放/暂停视频',
    },
    {
      key: 'ArrowRight',
      handler: () => onNextStep?.(),
      description: '下一步',
    },
    {
      key: 'ArrowLeft',
      handler: () => onPrevStep?.(),
      description: '上一步',
    },
    {
      key: 'Enter',
      handler: () => onConfirm?.(),
      description: '确认当前步骤',
    },
    {
      key: 'r',
      handler: () => onRegenerate?.(),
      description: '重新生成',
    },
  ]);
}
```

- [ ] **Step 2: 创建快捷键帮助组件**

```typescript
// src/components/KeyboardShortcutsHelp.tsx
'use client';

import { useState } from 'react';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  { key: '⌘/Ctrl + N', description: '新建创作', scope: '全局' },
  { key: 'Space', description: '播放/暂停视频', scope: '任务详情' },
  { key: '→ / ←', description: '切换步骤', scope: '任务详情' },
  { key: '↑ / ↓', description: '选择图片', scope: '图片选择' },
  { key: 'Enter', description: '确认当前步骤', scope: '任务详情' },
  { key: 'Esc', description: '返回/关闭', scope: '全局' },
  { key: 'R', description: '重新生成', scope: '任务详情' },
  { key: '⌘/Ctrl + C', description: '复制选中内容', scope: '发布内容' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-gray-700"
        title="键盘快捷键"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">键盘快捷键</h2>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex justify-between items-center">
                  <span className="text-gray-600">{shortcut.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{shortcut.scope}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full py-2 bg-gray-900 text-white rounded-lg"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: 在布局中添加全局快捷键和帮助按钮**

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add keyboard shortcuts support"
```

---

## Task S7: 图片 Lightbox 预览

**Files:**
- Create: `src/components/workflow/ImageLightbox.tsx`
- Modify: `src/app/task/[id]/page.tsx`

- [ ] **Step 1: 创建 Lightbox 组件**

```typescript
// src/components/workflow/ImageLightbox.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onNavigate(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
          break;
      }
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
      >
        <X className="w-8 h-8" />
      </button>

      {/* 导航按钮 */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 p-2 text-white/80 hover:text-white"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}
      {currentIndex < images.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 p-2 text-white/80 hover:text-white"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}

      {/* 主图 */}
      <div className="max-w-[90vw] max-h-[90vh]">
        <img
          src={images[currentIndex]}
          alt={`图片 ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/80">
        <p>
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* 缩略图导航 */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`w-12 h-12 rounded overflow-hidden border-2 ${
              idx === currentIndex ? 'border-white' : 'border-transparent'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// 图片对比模式
interface ImageCompareProps {
  image1: string;
  image2: string;
  onClose: () => void;
}

export function ImageCompare({ image1, image2, onClose }: ImageCompareProps) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-10"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center p-4">
          <img src={image1} alt="图片 1" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 border-l border-white/20">
          <img src={image2} alt="图片 2" className="max-w-full max-h-full object-contain" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在任务详情页集成 Lightbox**

在图片选择步骤添加：
```typescript
const [lightboxOpen, setLightboxOpen] = useState(false);
const [lightboxIndex, setLightboxIndex] = useState(0);
const [compareImages, setCompareImages] = useState<string[] | null>(null);

// 在图片网格中
<ImageLightbox
  images={images}
  currentIndex={lightboxIndex}
  isOpen={lightboxOpen}
  onClose={() => setLightboxOpen(false)}
  onNavigate={setLightboxIndex}
/>

{compareImages && (
  <ImageCompare
    image1={compareImages[0]}
    image2={compareImages[1]}
    onClose={() => setCompareImages(null)}
  />
)}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add image lightbox preview and compare mode"
```

---

## Task S8: 全自动模式配乐引导

**Files:**
- Modify: `src/app/api/tasks/[id]/auto-run/route.ts`
- Modify: `src/app/task/[id]/page.tsx`

- [ ] **Step 1: 更新全自动运行 API**

修改全自动 API，完成后返回提示信息：
```typescript
return NextResponse.json({
  success: true,
  task: updatedTask,
  message: '全自动模式已完成视频生成',
  nextStep: {
    label: '添加配乐',
    description: '视频已生成，请上传配乐完成最终作品',
    action: 'upload_audio',
  },
});
```

- [ ] **Step 2: 在任务详情页显示配乐引导**

当任务状态为 `video_generated` 且模式为 `auto` 时：
```typescript
{task.status === 'video_generated' && task.mode === 'auto' && (
  <Card className="bg-amber-50 border-amber-200">
    <CardHeader>
      <CardTitle>🎵 添加配乐完成作品</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-gray-600">
        全自动模式已完成视频生成。请上传配乐文件，合成最终版本。
      </p>
      <div>
        <input
          type="file"
          accept="audio/mpeg,audio/wav"
          onChange={handleAudioUpload}
          className="block w-full text-sm text-gray-500"
        />
      </div>
      <Button onClick={handleMergeAudio} disabled={!audioFile}>
        合并配乐
      </Button>
    </CardContent>
  </Card>
)}
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add audio merge guidance for auto mode"
```

---

## 总结

本补充计划涵盖 8 个新增功能任务：

| 任务 | 功能 | 文件数 | 预估时间 |
|------|------|--------|----------|
| S1 | API 响应格式规范化 | 8 | 30 min |
| S2 | 文件存储优化 | 4 | 45 min |
| S3 | 任务队列与并发控制 | 3 | 30 min |
| S4 | 任务超时检测与恢复 | 3 | 45 min |
| S5 | 加载状态细化组件 | 3 | 30 min |
| S6 | 键盘快捷键支持 | 3 | 30 min |
| S7 | 图片 Lightbox 预览 | 2 | 45 min |
| S8 | 全自动模式配乐引导 | 2 | 20 min |

**总预估时间**: 约 4-5 小时

**依赖关系**:
- S1-S4 为基础功能，可并行实施
- S5-S8 依赖基础架构，建议在 S1-S4 完成后实施
