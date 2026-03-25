"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/config";
import { ArrowLeft, Copy, Check, Home, Plus, Film } from "lucide-react";

export default function PublishPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  async function fetchTask() {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
      }
    } catch (error) {
      console.error("Failed to fetch task:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, type: string) {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCopyAll() {
    if (!task) return;
    const all = `【标题】\n${task.title || ""}\n\n【文案】\n${task.content || ""}\n\n【标签】\n${task.tags?.join(" ") || ""}`;
    await navigator.clipboard.writeText(all);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-[var(--color-text-secondary)] mb-4">任务不存在</p>
        <Link href="/">
          <Button>返回首页</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="h-16 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-full flex items-center">
          <Link
            href={`/task/${taskId}`}
            className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>返回</span>
          </Link>
          <h1 className="ml-4 text-lg font-semibold text-[var(--color-text-primary)]">
            发布辅助
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-[var(--color-success)]" />
          </div>
          <h2 className="text-h1 mb-3 text-[var(--color-text-primary)]">
            视频已生成！
          </h2>
          <p className="text-body text-[var(--color-text-secondary)]">
            以下是为你准备的发布内容
          </p>
        </div>

        {/* Video Preview */}
        {task.videoUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden bg-black shadow-lg">
            <video
              src={task.videoUrl}
              controls
              className="w-full aspect-video"
              poster={task.selectedImage}
            />
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                标题
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(task.title || "", "title")}
              >
                {copied === "title" ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                复制
              </Button>
            </div>
            <p className="text-body text-[var(--color-text-primary)]">
              {task.title || "温馨治愈的家居时光，这就是我向往的生活"}
            </p>
          </section>

          {/* Content */}
          <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                文案
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(task.content || "", "content")}
              >
                {copied === "content" ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                复制
              </Button>
            </div>
            <p className="text-body text-[var(--color-text-primary)] whitespace-pre-line">
              {task.content ||
                "在这个快节奏的世界里，找到属于自己的宁静角落是多么珍贵。一杯热茶，一本好书，阳光透过窗户洒在地板上，时间仿佛慢了下来。这就是生活本该有的样子。"}
            </p>
          </section>

          {/* Tags */}
          <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                标签
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(task.tags?.join(" ") || "", "tags")}
              >
                {copied === "tags" ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                复制
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(task.tags || ["#治愈系", "#家居生活", "#慢生活", "#生活美学", "#温馨小窝"]).map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-[var(--color-bg)] rounded-full text-sm text-[var(--color-text-secondary)]"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </section>

          {/* Copy All */}
          <div className="pt-4 flex justify-center">
            <Button size="lg" onClick={handleCopyAll} className="rounded-full px-8">
              {copied === "all" ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  已复制全部
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  一键复制全部
                </>
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 pt-6">
            <Link href="/">
              <Button variant="secondary">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <Link href="/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建创作
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
