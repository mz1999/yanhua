"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GenerationCard } from "@/components/ui/generation-card";
import { StepIndicator } from "@/components/ui/step-indicator";
import { ArchitecturalSelector } from "@/components/ui/architectural-selector";
import { RegionSelector } from "@/components/ui/region-selector";
import { SpaceInput } from "@/components/ui/space-input";
import type { Task } from "@/lib/config";
import {
  coreEmotions,
  spacePresets,
  weatherOptions,
  lightingQualities,
  paintingStyles,
} from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  RefreshCw,
  Check,
  ArrowRight,
  Film,
  Copy,
  Edit3,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
  Wand2,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Moon,
  Settings2,
} from "lucide-react";

// 模拟图片生成
const mockImages = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop",
];

// 天气图标映射
const weatherIcons: Record<string, React.ReactNode> = {
  "晴朗": <Sun className="w-5 h-5" />,
  "多云": <Cloud className="w-5 h-5" />,
  "雨天": <CloudRain className="w-5 h-5" />,
  "极端": <Snowflake className="w-5 h-5" />,
  "特殊": <Cloud className="w-5 h-5" />,
  "黄昏/夜晚": <Moon className="w-5 h-5" />,
};

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

// 解析 JSON 字符串
function parseJSON<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
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

  // 提示词编辑相关状态
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptPanel, setShowPromptPanel] = useState(false);

  // 克隆相关状态
  const [isCloning, setIsCloning] = useState(false);

  // Draft 配置编辑状态
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [config, setConfig] = useState({
    coreEmotion: "",
    architecturalStyle: "",
    region: undefined as string | undefined,
    spaceFunction: "",
    weather: "",
    lightingQualities: [] as string[],
    paintingStyles: [] as string[],
    description: "",
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

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
        const fetchedTask = data.task;
        setTask(fetchedTask);
        if (fetchedTask.selectedImage) {
          setSelectedImage(fetchedTask.selectedImage);
        }
        // 初始化 draft 配置
        if (fetchedTask.status === "draft") {
          setConfig({
            coreEmotion: fetchedTask.coreEmotion || "",
            architecturalStyle: fetchedTask.architecturalStyle || "",
            region: fetchedTask.region || undefined,
            spaceFunction: fetchedTask.spaceFunction || "",
            weather: fetchedTask.weather || "",
            lightingQualities: parseJSON(fetchedTask.lightingQualities, []),
            paintingStyles: parseJSON(fetchedTask.paintingStyles, []),
            description: fetchedTask.description || "",
          });
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
        // 保存生成的提示词
        if (data.prompt) {
          setGeneratedPrompt(data.prompt);
          setCustomPrompt(data.prompt);
        }
      }
    } catch (error) {
      console.error("Failed to generate images:", error);
      // 模拟数据
      const mockPrompt = "治愈系风格，精细漫画，岭南建筑，广州的老街咖啡馆，雨天，自然窗光、斑驳光影，高清细节，电影质感，治愈氛围，竖屏构图，9:16比例，适合手机竖屏观看";
      setGeneratedPrompt(mockPrompt);
      setCustomPrompt(mockPrompt);
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

  async function generateImagesWithCustomPrompt() {
    if (!customPrompt.trim()) return;

    setGenerating(true);
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await fetch(`/api/tasks/${taskId}/generate-images-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPrompt: customPrompt.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setSelectedImage(null); // 清除之前的选择
        setIsEditingPrompt(false);
      }
    } catch (error) {
      console.error("Failed to generate images with custom prompt:", error);
      // 模拟数据
      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: "selecting",
              images: mockImages.map((url) => url + "?" + Date.now()), // 模拟不同的图片
              selectedImage: undefined,
            }
          : null
      );
      setSelectedImage(null);
      setIsEditingPrompt(false);
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

  async function cloneTask() {
    setIsCloning(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/clone`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        // 跳转到新任务
        router.push(`/task/${data.task.id}`);
      }
    } catch (error) {
      console.error("Failed to clone task:", error);
      alert("复制项目失败，请重试");
    } finally {
      setIsCloning(false);
    }
  }

  async function handleCopy(text: string, type: string) {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  // 处理单选
  const handleSingleSelect = (field: keyof typeof config, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  // 处理多选
  const handleMultiToggle = (field: "lightingQualities" | "paintingStyles", value: string) => {
    const current = config[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setConfig({ ...config, [field]: updated });
  };

  // 处理地域选择
  const handleRegionChange = (value: string | undefined) => {
    setConfig({ ...config, region: value });
  };

  // 保存配置并开始生成
  async function saveConfigAndGenerate() {
    if (!task) return;

    setSavingConfig(true);
    try {
      // 1. 更新任务配置
      const updateRes = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          status: "generating_images",
        }),
      });

      if (updateRes.ok) {
        const data = await updateRes.json();
        setTask(data.task);
        setIsEditingConfig(false);
        // 开始生成图片
        generateImages();
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("保存配置失败，请重试");
    } finally {
      setSavingConfig(false);
    }
  }

  const canSubmit =
    config.coreEmotion &&
    config.architecturalStyle &&
    config.spaceFunction &&
    config.weather;

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

  const isDraft = task.status === "draft";
  const isStep1 = task.status === "generating_images" || task.status === "selecting";
  const isStep2 = task.status === "generating_video" || task.status === "completed";

  const sectionNumber = (num: number) => (
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium">
      {num}
    </span>
  );

  // Draft 状态：显示配置编辑界面
  if (isDraft) {
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
                配置创作 #{task.id.slice(0, 8)}
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-h1 mb-3 text-[var(--color-text-primary)]">
              配置你的画面
            </h2>
            <p className="text-body text-[var(--color-text-secondary)]">
              这是复制的项目，你可以修改配置后再生成
            </p>
          </div>

          <div className="space-y-10">
            {/* 1. 核心情绪 - 最重要 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {sectionNumber(1)}
                <h3 className="text-h3 text-[var(--color-text-primary)]">核心情绪</h3>
                <span className="text-xs text-[var(--color-error)]">*</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                画面要传达的核心情感，决定了整体基调
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {coreEmotions.map((emotion) => (
                  <EmotionCard
                    key={emotion.id}
                    label={emotion.label}
                    description={emotion.description}
                    useCase={emotion.useCase}
                    selected={config.coreEmotion === emotion.label}
                    onClick={() => handleSingleSelect("coreEmotion", emotion.label)}
                  />
                ))}
              </div>
            </section>

            {/* 2. 建筑风格/文化基因 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {sectionNumber(2)}
                <h3 className="text-h3 text-[var(--color-text-primary)]">建筑风格/文化基因</h3>
                <span className="text-xs text-[var(--color-error)]">*</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                空间的"建筑语言"和"文化元素"，决定"这是什么风格的空间"
              </p>
              <ArchitecturalSelector
                value={config.architecturalStyle}
                onChange={(value) => handleSingleSelect("architecturalStyle", value)}
              />
            </section>

            {/* 3. 地域（可选） */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {sectionNumber(3)}
                <h3 className="text-h3 text-[var(--color-text-primary)]">地域</h3>
                <span className="text-xs text-[var(--color-text-tertiary)] font-normal">（可选）</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                真实的地理位置，与建筑风格叠加产生化学反应
              </p>
              <RegionSelector
                value={config.region}
                onChange={handleRegionChange}
              />
            </section>

            {/* 4. 空间功能 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {sectionNumber(4)}
                <h3 className="text-h3 text-[var(--color-text-primary)]">空间功能</h3>
                <span className="text-xs text-[var(--color-error)]">*</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                这个空间用来做什么？支持自由输入或选择预设
              </p>
              <SpaceInput
                value={config.spaceFunction}
                onChange={(value) => handleSingleSelect("spaceFunction", value)}
                presets={spacePresets}
                placeholder="输入空间功能，如'社区咖啡馆'、'阁楼画室'、'屋顶花园'..."
              />
            </section>

            {/* 5. 天气/氛围 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {sectionNumber(5)}
                <h3 className="text-h3 text-[var(--color-text-primary)]">天气/氛围</h3>
                <span className="text-xs text-[var(--color-error)]">*</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                天气状况和特殊氛围
              </p>

              {/* 天气选择面板 */}
              <div className="space-y-3">
                {weatherOptions.map((category) => (
                  <div
                    key={category.category}
                    className="border border-[var(--color-border)] rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === `weather-${category.category}`
                            ? null
                            : `weather-${category.category}`
                        )
                      }
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3",
                        "hover:bg-[#fafafa] transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-text-tertiary)]">
                          {weatherIcons[category.category]}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {category.category}
                        </span>
                        {category.options.some((o) => config.weather === o.label) && (
                          <span className="text-xs text-[var(--color-success)]">
                            已选择
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-[var(--color-text-tertiary)] transition-transform",
                          expandedSection === `weather-${category.category}` && "rotate-180"
                        )}
                      />
                    </button>

                    {expandedSection === `weather-${category.category}` && (
                      <div className="px-4 pb-4 space-y-2">
                        {category.options.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSingleSelect("weather", option.label)}
                            className={cn(
                              "w-full px-3 py-3 rounded-lg text-left transition-all",
                              "border",
                              config.weather === option.label
                                ? "border-[var(--color-accent)] bg-[#fafafa] shadow-[0_0_0_1px_var(--color-accent)]"
                                : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                            )}
                          >
                            <div className="font-medium text-sm text-[var(--color-text-primary)]">
                              {option.label}
                            </div>
                            <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 6. 光影质感（多选） */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {sectionNumber(6)}
                <h3 className="text-h3 text-[var(--color-text-primary)]">光影质感</h3>
                <span className="text-xs text-[var(--color-text-tertiary)] font-normal">（可多选）</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                光线的质感特征，可多选叠加
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lightingQualities.map((lighting) => (
                  <CheckboxCard
                    key={lighting.id}
                    label={lighting.label}
                    description={lighting.description}
                    selected={config.lightingQualities.includes(lighting.label)}
                    onClick={() => handleMultiToggle("lightingQualities", lighting.label)}
                  />
                ))}
              </div>
            </section>

            {/* 7. 绘画风格（多选） */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {sectionNumber(7)}
                <h3 className="text-h3 text-[var(--color-text-primary)]">绘画风格</h3>
                <span className="text-xs text-[var(--color-text-tertiary)] font-normal">（可多选）</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                画面的绘制风格/质感
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paintingStyles.map((style) => (
                  <CheckboxCard
                    key={style.id}
                    label={style.label}
                    description={style.description}
                    selected={config.paintingStyles.includes(style.label)}
                    onClick={() => handleMultiToggle("paintingStyles", style.label)}
                  />
                ))}
              </div>
            </section>

            {/* 补充描述 */}
            <section>
              <h3 className="text-h3 mb-4 text-[var(--color-text-primary)]">
                补充描述 <span className="text-[var(--color-text-tertiary)] font-normal text-sm">（可选）</span>
              </h3>
              <textarea
                value={config.description}
                onChange={(e) =>
                  setConfig({ ...config, description: e.target.value })
                }
                placeholder="输入更多细节，如人物动作、特定物品、氛围要求..."
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors resize-none"
                rows={4}
              />
            </section>

            {/* Submit */}
            <div className="pt-6 flex justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push("/")}
              >
                取消
              </Button>
              <Button
                size="lg"
                disabled={!canSubmit || savingConfig}
                onClick={saveConfigAndGenerate}
                className="rounded-full px-10"
              >
                {savingConfig ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    生成4张候选图
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

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

            {/* Prompt Editor Panel */}
            {generatedPrompt && (
              <div className="max-w-3xl mx-auto mt-8">
                <button
                  onClick={() => setShowPromptPanel(!showPromptPanel)}
                  className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-3"
                >
                  {showPromptPanel ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>生成的提示词</span>
                </button>

                {showPromptPanel && (
                  <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
                    {isEditingPrompt ? (
                      <div className="space-y-3">
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="w-full h-32 p-3 text-sm bg-white border border-[var(--color-border)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]"
                          placeholder="输入自定义提示词..."
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setIsEditingPrompt(false);
                              setCustomPrompt(generatedPrompt);
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            取消
                          </Button>
                          <Button
                            size="sm"
                            onClick={generateImagesWithCustomPrompt}
                            disabled={generating || !customPrompt.trim()}
                          >
                            {generating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                生成中...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                使用此提示词重新生成
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                          {generatedPrompt}
                        </p>
                        <div className="flex justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsEditingPrompt(true)}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            编辑提示词
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center max-w-3xl mx-auto mt-10 pt-6 border-t border-[var(--color-border)]">
              {/* Left: Edit Prompt & Clone */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!generatedPrompt) {
                      // 如果没有提示词，先生成
                      generateImages();
                    } else {
                      setShowPromptPanel(true);
                      setIsEditingPrompt(true);
                    }
                  }}
                  disabled={generating}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  编辑提示词
                </Button>
                <Button
                  variant="secondary"
                  onClick={cloneTask}
                  disabled={isCloning}
                >
                  {isCloning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      复制中...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      复制项目
                    </>
                  )}
                </Button>
              </div>

              {/* Right: Regenerate & Generate Video */}
              <div className="flex items-center gap-2">
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

// 情绪卡片组件
interface EmotionCardProps {
  label: string;
  description: string;
  useCase: string;
  selected?: boolean;
  onClick?: () => void;
}

function EmotionCard({ label, description, useCase, selected, onClick }: EmotionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-4 rounded-xl border text-left transition-all",
        "border-[var(--color-border)] bg-[var(--color-surface)]",
        "hover:border-[var(--color-border-hover)]",
        selected && [
          "border-[var(--color-accent)] bg-[#fafafa]",
          "shadow-[0_0_0_1px_var(--color-accent)]",
        ]
      )}
    >
      <div className="font-medium text-[var(--color-text-primary)] mb-1">
        {label}
      </div>
      <div className="text-sm text-[var(--color-text-secondary)] mb-2">
        {description}
      </div>
      <div className="text-xs text-[var(--color-text-tertiary)]">
        适用：{useCase}
      </div>
    </button>
  );
}

// 复选框卡片组件
interface CheckboxCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
}

function CheckboxCard({ label, description, selected, onClick }: CheckboxCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 cursor-pointer",
        "border-[var(--color-border)] bg-[var(--color-surface)]",
        "hover:border-[var(--color-border-hover)]",
        selected && [
          "border-[var(--color-accent)] bg-[#fafafa]",
          "shadow-[0_0_0_1px_var(--color-accent)]",
        ]
      )}
    >
      <div
        className={cn(
          "mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
          selected
            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
            : "border-[var(--color-border)] bg-white"
        )}
      >
        {selected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium block",
            selected
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-secondary)]"
          )}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-[var(--color-text-tertiary)] mt-0.5 block">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
