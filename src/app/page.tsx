"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/config";
import { getStatusLabel, getStatusColor } from "@/lib/config";
import { parseImages } from "@/lib/utils";
import { Plus, Settings, Image as ImageIcon, Copy, Loader2, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);

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

  async function cloneTask(e: React.MouseEvent, taskId: string) {
    e.preventDefault();
    e.stopPropagation();

    setCloningId(taskId);
    try {
      // 跳转到创建页面，带上 clone 参数
      router.push(`/create?clone=${taskId}`);
    } catch (error) {
      console.error("Failed to clone task:", error);
      alert("复制项目失败，请重试");
    } finally {
      setCloningId(null);
    }
  }

  return (
    <main className="min-h-screen relative">
      {/* 水墨装饰背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-radial from-[rgba(58,107,111,0.03)] to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-gradient-radial from-[rgba(201,55,86,0.02)] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-radial from-[rgba(58,107,111,0.02)] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="seal seal-sm">言</div>
              <span className="font-serif text-xl font-medium text-[var(--color-moshui)] tracking-wider">
                言画
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/create">
                <button className="btn-zhusha py-2.5 px-5 text-sm">
                  <Plus className="w-4 h-4" />
                  新建创作
                </button>
              </Link>
              <Link href="/settings">
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-shuiyin)] transition-colors">
                  <Settings className="w-5 h-5 text-[var(--color-huise)]" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* 诗意副标题 */}
          <p className="text-caption text-[var(--color-danyan)] mb-6 animate-fade-in-up">
            POETIC IMAGE CREATION
          </p>

          {/* 主标题 */}
          <h1 className="text-hero text-[var(--color-moshui)] mb-6 animate-fade-in-up delay-100">
            以文字为墨
            <br />
            <span className="text-[var(--color-zhusha)]">绘心中之境</span>
          </h1>

          {/* 描述 */}
          <p className="text-poetry max-w-lg mx-auto mb-10 animate-fade-in-up delay-200">
            通过诗意的空间配置，创作独特的治愈系视觉作品
            <br />
            让每一处空间都成为心灵的栖息地
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link href="/create">
              <button className="btn-zhusha">
                <Plus className="w-5 h-5" />
                开始创作
              </button>
            </Link>
            {tasks.length > 0 && (
              <Link href="#works">
                <button className="btn-moxian">
                  查看作品
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* 装饰墨线 */}
        <div className="max-w-xs mx-auto mt-16">
          <div className="divider-moxian animate-fade-in-up delay-400" />
        </div>
      </section>

      {/* Tasks Section */}
      <section id="works" className="px-6 pb-24 relative">
        <div className="max-w-6xl mx-auto">
          {/* 区块标题 */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-subtitle text-[var(--color-moshui)]">最近创作</h2>
              <p className="text-small text-[var(--color-danyan)] mt-1">
                {tasks.length} 件作品
              </p>
            </div>
            {tasks.length > 6 && (
              <Link href="#">
                <button className="btn-moxian text-sm">
                  查看全部
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-[var(--color-shuiyin)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[var(--color-shuiyin)] flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-[var(--color-danyan)]" />
              </div>
              <p className="text-subtitle text-[var(--color-huise)] mb-3">
                尚无创作
              </p>
              <p className="text-small text-[var(--color-danyan)] mb-8">
                开始你的第一件作品，让诗意在画面中流淌
              </p>
              <Link href="/create">
                <button className="btn-qingdai">
                  <Plus className="w-4 h-4" />
                  开始创作
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tasks.map((task, index) => (
                <Link key={task.id} href={`/task/${task.id}`}>
                  <div
                    className="group card-xuanzhi overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Preview */}
                    <div className="aspect-[4/3] bg-[var(--color-shuiyin)] relative overflow-hidden">
                      {(() => {
                        const images = parseImages(task.images);
                        const previewImage = task.selectedImage || images[0];

                        if (previewImage) {
                          return (
                            <img
                              src={previewImage}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          );
                        }

                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            {task.status === "draft" ? (
                              <Settings className="w-10 h-10 text-[var(--color-danyan)]" />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-[var(--color-danyan)]" />
                            )}
                          </div>
                        );
                      })()}

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`status-badge ${
                          task.status === "draft" ? "status-draft" :
                          task.status === "generating_images" ? "status-generating" :
                          "status-completed"
                        }`}>
                          {task.status === "generating_images" && (
                            <span className="w-1.5 h-1.5 bg-[var(--color-qingdai)] rounded-full animate-pulse" />
                          )}
                          {getStatusLabel(task.status)}
                        </span>
                      </div>

                      {/* Clone Button */}
                      <button
                        onClick={(e) => cloneTask(e, task.id)}
                        disabled={cloningId === task.id}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[var(--color-huise)] hover:text-[var(--color-zhusha)] hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50"
                        title="复制项目"
                      >
                        {cloningId === task.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="tag-xuanzhi">{task.coreEmotion}</span>
                        <span className="tag-xuanzhi">{task.architecturalStyle}</span>
                      </div>
                      <p className="text-small text-[var(--color-huise)]">
                        {task.spaceFunction}
                        {task.region && ` · ${task.region}`}
                      </p>
                      <p className="text-caption text-[var(--color-danyan)] mt-3">
                        {new Date(task.createdAt).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--color-yanzhi)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-caption text-[var(--color-danyan)]">
            言画 · 以文字绘心境
          </p>
          <p className="text-caption text-[var(--color-danyan)]">
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
