"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/config";
import { Plus, Settings, Image as ImageIcon, Film } from "lucide-react";

// 解析 images - 支持 string[] 或 JSON string
function parseImages(images: string[] | string | undefined | null): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      generating_images: "生成图片中",
      selecting: "选择图片",
      generating_video: "生成视频中",
      completed: "已完成",
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      generating_images: "bg-[var(--color-loading)]",
      selecting: "bg-[var(--color-loading)]",
      generating_video: "bg-[var(--color-loading)]",
      completed: "bg-[var(--color-success)]",
    };
    return colors[status] || "bg-gray-400";
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="h-16 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-[var(--color-text-primary)]">
            言画
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                新建创作
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-display mb-4 text-[var(--color-text-primary)]">
            欢迎回来
          </h1>
          <p className="text-h3 text-[var(--color-text-secondary)] mb-8">
            开始你的下一个创作
          </p>
          <Link href="/create">
            <Button size="lg" className="rounded-full px-8">
              <Plus className="w-5 h-5 mr-2" />
              新建创作
            </Button>
          </Link>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 text-[var(--color-text-primary)]">最近创作</h2>
            {tasks.length > 0 && (
              <Link
                href="#"
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                查看全部
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-[var(--color-border)] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-border)] flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-[var(--color-text-tertiary)]" />
              </div>
              <p className="text-body text-[var(--color-text-secondary)] mb-4">
                还没有创作
              </p>
              <Link href="/create">
                <Button>开始创作</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <Link key={task.id} href={`/task/${task.id}`}>
                  <div className="group rounded-2xl overflow-hidden bg-[var(--color-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                    {/* Preview */}
                    <div className="aspect-video bg-[var(--color-border)] relative overflow-hidden">
                      {(() => {
                        const images = parseImages(task.images);
                        const previewImage = task.selectedImage || images[0];

                        if (previewImage) {
                          return (
                            <img
                              src={previewImage}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          );
                        }

                        if (task.videoUrl) {
                          return (
                            <video
                              src={task.videoUrl}
                              className="w-full h-full object-cover"
                            />
                          );
                        }

                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            {task.status === "generating_video" ? (
                              <Film className="w-10 h-10 text-[var(--color-text-tertiary)]" />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-[var(--color-text-tertiary)]" />
                            )}
                          </div>
                        );
                      })()}
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
                        <span>{task.coreEmotion}</span>
                        <span>·</span>
                        <span>{task.architecturalStyle}</span>
                      </div>
                      <p className="text-small text-[var(--color-text-tertiary)] mt-2">
                        {task.spaceFunction}
                        {task.region && ` · ${task.region}`}
                      </p>
                      <p className="text-small text-[var(--color-text-tertiary)] mt-1">
                        {new Date(task.createdAt).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
