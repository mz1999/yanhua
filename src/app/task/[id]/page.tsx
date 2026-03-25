"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GenerationCard } from "@/components/ui/generation-card";
import { StepIndicator } from "@/components/ui/step-indicator";
import type { Task } from "@/lib/config";
import { ArrowLeft, RefreshCw, Check, ArrowRight, Film, Copy, Home, Plus } from "lucide-react";

// 模拟图片生成
const mockImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop",
];

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

export default function TaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  // Auto-generate images if task is in generating_images state and no images yet
  useEffect(() => {
    if (task && task.status === "generating_images" && !task.images && !generating) {
      generateImages();
    }
  }, [task, generating]);

  async function fetchTask() {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        if (data.task.selectedImage) {
          setSelectedImage(data.task.selectedImage);
        }
      }
    } catch (error) {
      console.error("Failed to fetch task:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateImages() {
    setGenerating(true);
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await fetch(`/api/tasks/${taskId}/generate-images`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
      }
    } catch (error) {
      console.error("Failed to generate images:", error);
      // 模拟数据
      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: "selecting",
              images: mockImages,
            }
          : null
      );
    } finally {
      setGenerating(false);
    }
  }

  async function generateVideo() {
    if (!selectedImage) return;

    setGenerating(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: selectedImage }),
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
      }
    } catch (error) {
      console.error("Failed to generate video:", error);
      // 模拟数据
      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: "completed",
              videoUrl: "https://example.com/video.mp4",
              title: "温馨治愈的家居时光，这就是我向往的生活",
              content:
                "在这个快节奏的世界里，找到属于自己的宁静角落是多么珍贵。一杯热茶，一本好书，阳光透过窗户洒在地板上，时间仿佛慢了下来。这就是生活本该有的样子。",
              tags: ["#治愈系", "#家居生活", "#慢生活", "#生活美学", "#温馨小窝"],
            }
          : null
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy(text: string, type: string) {
    await navigator.clipboard.writeText(text);
    setCopied(type);
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

  const isStep1 = task.status === "generating_images" || task.status === "selecting";
  const isStep2 = task.status === "generating_video" || task.status === "completed";

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="h-16 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>返回</span>
            </Link>
            <h1 className="ml-4 text-lg font-semibold text-[var(--color-text-primary)]">
              创作 #{task.id.slice(0, 8)}
            </h1>
          </div>
          <StepIndicator
            currentStep={isStep1 ? 1 : 2}
            totalSteps={2}
          />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {isStep1 ? (
          // Step 1: Select Image
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-h1 mb-3 text-[var(--color-text-primary)]">
                选择一张图片
              </h2>
              <p className="text-body text-[var(--color-text-secondary)]">
                点击任意图片查看大图，选择最满意的一张
              </p>
            </div>

            {!task.images || generating ? (
              <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[var(--color-border)] rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
                {parseImages(task.images).map((image, i) => (
                  <GenerationCard
                    key={i}
                    imageUrl={image}
                    selected={selectedImage === image}
                    onClick={() => setSelectedImage(image)}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center max-w-3xl mx-auto mt-10 pt-6 border-t border-[var(--color-border)]">
              <Button
                variant="secondary"
                onClick={generateImages}
                disabled={generating}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
                重新生成
              </Button>
              <Button
                onClick={() => {
                  if (selectedImage) {
                    generateVideo();
                  }
                }}
                disabled={!selectedImage || generating}
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    生成视频
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Video Result
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <h2 className="text-h1 mb-3 text-[var(--color-text-primary)]">
                {task.status === "generating_video" ? "生成视频中..." : "视频已生成"}
              </h2>
            </div>

            {/* Video Player */}
            <div className="max-w-2xl mx-auto">
              {task.videoUrl ? (
                <div className="rounded-2xl overflow-hidden bg-black shadow-lg">
                  <video
                    src={task.videoUrl}
                    controls
                    className="w-full aspect-video"
                    poster={task.selectedImage}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-[var(--color-border)] rounded-2xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
                    <p className="text-[var(--color-text-secondary)]">正在生成视频...</p>
                  </div>
                </div>
              )}

              {/* Source Image */}
              {task.selectedImage && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    基于你选择的图片生成
                  </span>
                  <button className="text-sm text-[var(--color-accent)] hover:underline">
                    查看原图
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4 mt-8">
                <Button variant="secondary" onClick={() => router.push(`/task/${task.id}`)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新生成视频
                </Button>
                <Link href={`/task/${task.id}/publish`}>
                  <Button>
                    <Check className="w-4 h-4 mr-2" />
                    完成创作
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
