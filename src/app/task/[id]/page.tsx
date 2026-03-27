"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, ChevronDown, ChevronUp, RefreshCw, Copy, X, Save, Edit3, Heart, Share2, Loader2, Trash2 } from "lucide-react";
import { parseImages } from "@/lib/utils";
import type { Task } from "@/lib/config";

export default function TaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const taskRef = useRef<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptPanel, setShowPromptPanel] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 同步 task 到 ref
  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  useEffect(() => {
    if (taskId) {
      fetchTask(taskId);
    }
  }, [taskId]);

  async function fetchTask(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`);
      if (res.ok) {
        const data = await res.json();
        const fetchedTask = data.task;
        setTask(fetchedTask);
        taskRef.current = fetchedTask;
        if (fetchedTask.selectedImage) {
          setSelectedImage(fetchedTask.selectedImage);
        }
        // 加载已保存的提示词
        if (fetchedTask.prompt) {
          setGeneratedPrompt(fetchedTask.prompt);
          setCustomPrompt(fetchedTask.prompt);
        }
        // 如果状态是 generating_images 且没有图片，自动触发生成
        if (fetchedTask.status === "generating_images" && !fetchedTask.images) {
          setTimeout(() => {
            generateImagesWithTask(fetchedTask);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Failed to fetch task:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateImagesWithTask(taskToGenerate: Task) {
    setGenerating(true);

    try {
      const res = await fetch(`/api/tasks/${taskToGenerate.id}/generate-images`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setSelectedImage(null);
        if (data.prompt) {
          setGeneratedPrompt(data.prompt);
          setCustomPrompt(data.prompt);
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: "生成失败" }));
        alert(errorData.error || "生成图片失败，请重试");
      }
    } catch (error) {
      console.error("Failed to generate images:", error);
      alert("生成图片失败，请检查网络连接");
    } finally {
      setGenerating(false);
    }
  }

  async function generateImages() {
    const currentTask = taskRef.current;
    if (!currentTask) return;
    await generateImagesWithTask(currentTask);
  }

  async function generateImagesWithCustomPrompt() {
    if (!customPrompt.trim() || !task) return;

    setGenerating(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}/generate-images-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPrompt: customPrompt.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setSelectedImage(null);
        setIsEditingPrompt(false);
      } else {
        const errorData = await res.json().catch(() => ({ error: "生成失败" }));
        alert(errorData.error || "生成图片失败，请重试");
      }
    } catch (error) {
      console.error("Failed to generate images with custom prompt:", error);
      alert("生成图片失败，请检查网络连接");
    } finally {
      setGenerating(false);
    }
  }

  async function completeTask() {
    if (!selectedImage || !task) return;

    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: selectedImage }),
      });
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        router.push(`/task/${task.id}/publish`);
      } else {
        alert("完成创作失败，请重试");
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
      alert("完成创作失败，请重试");
    }
  }

  async function cloneTask() {
    if (!task) return;
    // 直接跳转到新建页面，带上 clone 参数预填充配置
    router.push(`/create?clone=${task.id}`);
  }

  async function deleteTask() {
    if (!task) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/");
      } else {
        alert("删除作品失败，请重试");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("删除作品失败，请重试");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-xuanzhi)]">
        <div className="loading-mo">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-xuanzhi)]">
        <p className="text-subtitle text-[var(--color-huise)] mb-6">创作不存在</p>
        <Link href="/">
          <button className="btn-qingdai">返回首页</button>
        </Link>
      </div>
    );
  }

  const isGenerating = task.status === "generating_images";
  const isCompleted = task.status === "completed";

  return (
    <main className="min-h-screen bg-[var(--color-xuanzhi)]">
      {/* 装饰背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-gradient-radial from-[rgba(58,107,111,0.02)] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-radial from-[rgba(201,55,86,0.02)] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-xuanzhi)]/80 backdrop-blur-sm border-b border-[var(--color-yanzhi)]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-[var(--color-huise)] hover:text-[var(--color-moshui)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <span className="font-serif text-[var(--color-moshui)]">创作 #{task.id.slice(0, 8)}</span>
            </div>

            {/* 步骤指示器 */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                isCompleted && selectedImage
                  ? "bg-[var(--color-qingdai)] text-white"
                  : "bg-[var(--color-zhusha)] text-white"
              )}>
                {isCompleted && selectedImage ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <div className="w-12 h-0.5 bg-[var(--color-yanzhi)]" />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                isCompleted && selectedImage
                  ? "bg-[var(--color-zhusha)] text-white"
                  : "bg-[var(--color-shuiyin)] text-[var(--color-danyan)]"
              )}>
                {isCompleted && selectedImage ? <Check className="w-4 h-4" /> : "2"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-24">
        {isGenerating || (isCompleted && !selectedImage) ? (
          // Step 1: Select Image
          <ImageSelectionStep
            task={task}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            generating={generating}
            generatedPrompt={generatedPrompt}
            isEditingPrompt={isEditingPrompt}
            setIsEditingPrompt={setIsEditingPrompt}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            showPromptPanel={showPromptPanel}
            setShowPromptPanel={setShowPromptPanel}
            onGenerate={generateImages}
            onGenerateCustom={generateImagesWithCustomPrompt}
            onClone={cloneTask}
            onComplete={completeTask}
            onDelete={() => setShowDeleteConfirm(true)}
            isDeleting={isDeleting}
          />
        ) : (
          // Step 2: Completed
          <CompletedStep
            task={task}
            onReselect={() => {
              setSelectedImage(null);
            }}
            onDelete={() => setShowDeleteConfirm(true)}
            isDeleting={isDeleting}
          />
        )}
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-xuanzhi)] rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-[var(--color-yanzhi)]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-zhusha)]/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[var(--color-zhusha)]" />
              </div>
              <h3 className="text-subtitle text-[var(--color-moshui)] mb-2">
                确认删除作品？
              </h3>
              <p className="text-body text-[var(--color-danyan)] mb-6">
                此操作不可撤销，作品将被永久删除。
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="btn-moxian"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  取消
                </button>
                <button
                  className="btn-zhusha"
                  onClick={deleteTask}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      删除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      确认删除
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// 图片选择步骤
function ImageSelectionStep({
  task,
  selectedImage,
  setSelectedImage,
  generating,
  generatedPrompt,
  isEditingPrompt,
  setIsEditingPrompt,
  customPrompt,
  setCustomPrompt,
  showPromptPanel,
  setShowPromptPanel,
  onGenerate,
  onGenerateCustom,
  onClone,
  onComplete,
  onDelete,
  isDeleting,
}: {
  task: Task;
  selectedImage: string | null;
  setSelectedImage: (img: string) => void;
  generating: boolean;
  generatedPrompt: string;
  isEditingPrompt: boolean;
  setIsEditingPrompt: (v: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (v: string) => void;
  showPromptPanel: boolean;
  setShowPromptPanel: (v: boolean) => void;
  onGenerate: () => void;
  onGenerateCustom: () => void;
  onClone: () => void;
  onComplete: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const images = parseImages(task.images);

  return (
    <div className="animate-fade-in-up">
      {/* 标题 */}
      <div className="text-center mb-12">
        <p className="text-caption text-[var(--color-danyan)] mb-3">SELECT YOUR FAVORITE</p>
        <h2 className="text-title text-[var(--color-moshui)] mb-4">
          挑选你最中意的一幅
        </h2>
        <p className="text-poetry">
          点击选择最符合你心意的画面，它将用于最终呈现
        </p>
      </div>

      {/* 图片网格 */}
      {!task.images || generating ? (
        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[9/16] bg-[var(--color-shuiyin)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          {images.map((image, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(image)}
              className={cn(
                "relative rounded-xl overflow-hidden transition-all duration-300",
                selectedImage === image
                  ? "ring-2 ring-[var(--color-zhusha)] ring-offset-4 ring-offset-[var(--color-xuanzhi)]"
                  : "hover:opacity-90"
              )}
            >
              <img
                src={image}
                alt={`候选 ${i + 1}`}
                className="w-full h-auto object-contain"
              />
              {selectedImage === image && (
                <div className="absolute inset-0 bg-[var(--color-zhusha)]/10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-zhusha)] text-white flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-[var(--color-huise)]">
                  候选 {i + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 提示词编辑面板 */}
      {(generatedPrompt || showPromptPanel) && (
        <div className="max-w-3xl mx-auto mt-10">
          <button
            onClick={() => setShowPromptPanel(!showPromptPanel)}
            className="flex items-center gap-2 text-small text-[var(--color-huise)] hover:text-[var(--color-moshui)] transition-colors mb-4"
          >
            {showPromptPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>查看生成的提示词</span>
          </button>

          {showPromptPanel && (
            <div className="card-xuanzhi p-5">
              {isEditingPrompt ? (
                <div className="space-y-4">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="input-xuanzhi min-h-[120px]"
                    placeholder="输入自定义提示词..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      className="btn-moxian"
                      onClick={() => {
                        setIsEditingPrompt(false);
                        setCustomPrompt(generatedPrompt || "");
                      }}
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                    <button
                      className="btn-zhusha"
                      onClick={onGenerateCustom}
                      disabled={generating || !customPrompt.trim()}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          使用此提示词重新生成
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-body text-[var(--color-moshui)] leading-relaxed">
                    {generatedPrompt || "（暂无提示词，点击编辑添加自定义提示词）"}
                  </p>
                  <div className="flex justify-end">
                    <button
                      className="btn-qingdai"
                      onClick={() => setIsEditingPrompt(true)}
                    >
                      <Edit3 className="w-4 h-4" />
                      编辑提示词
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between items-center max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--color-yanzhi)]">
        <div className="flex items-center gap-3">
          <button
            className="btn-moxian"
            onClick={() => {
              // 总是进入编辑模式，无论是否有提示词
              setShowPromptPanel(true);
              setIsEditingPrompt(true);
            }}
            disabled={generating}
          >
            <Edit3 className="w-4 h-4" />
            编辑提示词
          </button>
          <button
            className="btn-moxian"
            onClick={onClone}
          >
            <Copy className="w-4 h-4" />
            复制项目
          </button>
          <button
            className="btn-moxian text-[var(--color-zhusha)] hover:text-[var(--color-zhusha)]"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="btn-qingdai"
            onClick={onGenerate}
            disabled={generating}
          >
            <RefreshCw className={cn("w-4 h-4", generating && "animate-spin")} />
            重新生成
          </button>
          <button
            className={cn(
              "btn-zhusha",
              !selectedImage && "opacity-50 cursor-not-allowed"
            )}
            onClick={onComplete}
            disabled={!selectedImage}
          >
            <Check className="w-4 h-4" />
            完成创作
          </button>
        </div>
      </div>
    </div>
  );
}

// 完成步骤
function CompletedStep({
  task,
  onReselect,
  onDelete,
  isDeleting,
}: {
  task: Task;
  onReselect: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const router = useRouter();

  return (
    <div className="animate-fade-in-up">
      {/* 标题 */}
      <div className="text-center mb-12">
        <p className="text-caption text-[var(--color-danyan)] mb-3">CREATION COMPLETE</p>
        <h2 className="text-title text-[var(--color-moshui)] mb-4">
          创作完成
        </h2>
        <p className="text-poetry">
          愿你在这片空间中，找到内心的宁静
        </p>
      </div>

      {/* 选中的图片 - 画框展示 */}
      <div className="max-w-2xl mx-auto">
        {task.selectedImage && (
          <div className="frame-hua">
            <img
              src={task.selectedImage}
              alt="Selected"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* 作品信息 */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="tag-xuanzhi">{task.coreEmotion}</span>
            <span className="tag-xuanzhi">{task.architecturalStyle}</span>
            <span className="tag-xuanzhi">{task.spaceFunction}</span>
          </div>
          <p className="text-small text-[var(--color-danyan)]">
            {new Date(task.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="btn-qingdai" onClick={onReselect}>
            <RefreshCw className="w-4 h-4" />
            重新选择
          </button>
          <Link href={`/task/${task.id}/publish`}>
            <button className="btn-zhusha">
              <Share2 className="w-4 h-4" />
              查看发布内容
            </button>
          </Link>
          <button
            className="btn-moxian text-[var(--color-zhusha)]"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            删除作品
          </button>
        </div>
      </div>
    </div>
  );
}
