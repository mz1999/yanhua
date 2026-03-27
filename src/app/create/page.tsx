"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  coreEmotions,
  spacePresets,
  weatherOptions,
  lightingQualities,
  paintingStyles,
  focuses,
} from "@/lib/config";
import { cn } from "@/lib/utils";
import { ArrowLeft, Wand2, Check, ChevronDown, Cloud, Sun, CloudRain, Snowflake, Moon, Brush, ArrowUp } from "lucide-react";

// 天气图标映射
const weatherIcons: Record<string, React.ReactNode> = {
  "晴朗": <Sun className="w-4 h-4" />,
  "多云": <Cloud className="w-4 h-4" />,
  "雨天": <CloudRain className="w-4 h-4" />,
  "极端": <Snowflake className="w-4 h-4" />,
  "特殊": <Cloud className="w-4 h-4" />,
  "黄昏/夜晚": <Moon className="w-4 h-4" />,
};

// 步骤配置
const steps = [
  { id: "emotion", label: "情绪", required: true },
  { id: "style", label: "风格", required: true },
  { id: "region", label: "地域", required: false },
  { id: "space", label: "空间", required: true },
  { id: "weather", label: "天气", required: true },
  { id: "light", label: "光影", required: false },
  { id: "paint", label: "画法", required: false },
  { id: "focus", label: "构图", required: true },
];

// 加载状态组件
function LoadingState() {
  return (
    <main className="min-h-screen bg-[var(--color-xuanzhi)] flex items-center justify-center">
      <div className="loading-mo">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CreatePageContent />
    </Suspense>
  );
}

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get("clone");
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [config, setConfig] = useState({
    coreEmotion: "",
    architecturalStyle: "",
    region: undefined as string | undefined,
    spaceFunction: "",
    weather: "",
    lightingQualities: [] as string[],
    paintingStyles: [] as string[],
    focus: "",
    description: "",
  });

  // 展开/折叠面板状态
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // 如果有 clone 参数，加载源项目配置
  useEffect(() => {
    if (cloneId) {
      setCloning(true);
      fetch(`/api/tasks/${cloneId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.task) {
            setConfig({
              coreEmotion: data.task.coreEmotion || "",
              architecturalStyle: data.task.architecturalStyle || "",
              region: data.task.region,
              spaceFunction: data.task.spaceFunction || "",
              weather: data.task.weather || "",
              lightingQualities: data.task.lightingQualities || [],
              paintingStyles: data.task.paintingStyles || [],
              focus: data.task.focus || "",
              description: data.task.description || "",
            });
          }
        })
        .catch((error) => {
          console.error("Failed to load source task:", error);
        })
        .finally(() => {
          setCloning(false);
        });
    }
  }, [cloneId]);

  // 监听滚动显示/隐藏返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      // 当滚动超过 400px 时显示按钮
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canSubmit =
    config.coreEmotion &&
    config.architecturalStyle &&
    config.spaceFunction &&
    config.weather &&
    config.focus;

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

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        const { task } = await res.json();
        router.push(`/task/${task.id}`);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setLoading(false);
    }
  }

  // 计算完成进度
  const completedSteps = [
    config.coreEmotion,
    config.architecturalStyle,
    config.region || true, // 可选的算完成
    config.spaceFunction,
    config.weather,
    config.lightingQualities.length > 0 || true, // 可选的算完成
    config.paintingStyles.length > 0 || true, // 可选的算完成
    config.focus,
  ].filter(Boolean).length;

  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <main className="min-h-screen bg-[var(--color-xuanzhi)]">
      {/* 装饰背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-[rgba(201,55,86,0.02)] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-gradient-radial from-[rgba(58,107,111,0.02)] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-xuanzhi)]/80 backdrop-blur-sm border-b border-[var(--color-yanzhi)]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--color-huise)] hover:text-[var(--color-moshui)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-caption text-[var(--color-danyan)]">创作进度</span>
              <div className="w-24 h-1.5 bg-[var(--color-shuiyin)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-zhusha)] to-[var(--color-qingdai)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-caption text-[var(--color-zhusha)]">{progress}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        {/* 诗意标题区 */}
        <div className="text-center mb-12">
          <p className="text-caption text-[var(--color-danyan)] mb-3">
            {cloneId ? "DUPLICATE CONFIGURATION" : "POETIC CONFIGURATION"}
          </p>
          <h1 className="text-title text-[var(--color-moshui)] mb-4">
            配置你的画面
          </h1>
          <p className="text-poetry max-w-md mx-auto">
            {cloneId ? (
              <>这是复制的项目，可以修改配置后再生成</>
            ) : (
              <>
                从八个维度编织空间的诗意
                <br />
                每一处选择都是心境的投射
              </>
            )}
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto py-2">
          {steps.map((step, index) => {
            const isCompleted =
              step.id === "emotion" ? config.coreEmotion :
              step.id === "style" ? config.architecturalStyle :
              step.id === "region" ? true :
              step.id === "space" ? config.spaceFunction :
              step.id === "weather" ? config.weather :
              step.id === "light" ? true :
              step.id === "paint" ? true :
              step.id === "focus" ? config.focus : false;

            const isActive = index === currentStep;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStep(index);
                  // 滚动到对应章节
                  const element = document.getElementById(step.id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full transition-all whitespace-nowrap",
                  isActive
                    ? "bg-[var(--color-moshui)] text-white"
                    : isCompleted
                    ? "bg-[var(--color-qingdai)]/10 text-[var(--color-qingdai)]"
                    : "bg-[var(--color-shuiyin)] text-[var(--color-danyan)]"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                  isActive
                    ? "bg-white/20"
                    : isCompleted
                    ? "bg-[var(--color-qingdai)]/20"
                    : "bg-[var(--color-yanzhi)]"
                )}>
                  {isCompleted && !isActive ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
                {step.required && (
                  <span className="text-[10px] opacity-60">*</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-16">
          {/* 1. 核心情绪 */}
          <section id="emotion" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-zhusha)]">壹</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">核心情绪</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  画面要传达的核心情感，决定整体基调
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* 2. 建筑风格 */}
          <section id="style" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-zhusha)]">贰</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">建筑风格</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  空间的建筑语言和文化元素
                </p>
              </div>
            </div>
            <ArchitecturalSelector
              value={config.architecturalStyle}
              onChange={(value) => handleSingleSelect("architecturalStyle", value)}
            />
          </section>

          {/* 3. 地域 */}
          <section id="region" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-qingdai)]">叁</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">地域</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  真实地理位置，与建筑风格叠加产生化学反应
                </p>
              </div>
            </div>
            <RegionSelector
              value={config.region}
              onChange={handleRegionChange}
            />
          </section>

          {/* 4. 空间功能 */}
          <section id="space" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-zhusha)]">肆</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">空间功能</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  这个空间用来做什么？
                </p>
              </div>
            </div>
            <SpaceInput
              value={config.spaceFunction}
              onChange={(value) => handleSingleSelect("spaceFunction", value)}
              presets={spacePresets}
              placeholder="如：社区咖啡馆、阁楼画室、屋顶花园..."
            />
          </section>

          {/* 5. 天气/氛围 */}
          <section id="weather" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-zhusha)]">伍</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">天气氛围</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  天气状况和特殊氛围
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {weatherOptions.map((category) => (
                <div
                  key={category.category}
                  className="card-xuanzhi overflow-hidden"
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
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-shuiyin)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-qingdai)]">
                        {weatherIcons[category.category]}
                      </span>
                      <span className="text-body text-[var(--color-moshui)]">
                        {category.category}
                      </span>
                      {category.options.some((o) => config.weather === o.label) && (
                        <span className="tag-zhusha">已选</span>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-[var(--color-danyan)] transition-transform",
                        expandedSection === `weather-${category.category}` && "rotate-180"
                      )}
                    />
                  </button>

                  {expandedSection === `weather-${category.category}` && (
                    <div className="px-5 pb-4 space-y-2">
                      {category.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSingleSelect("weather", option.label)}
                          className={cn(
                            "w-full px-4 py-3 rounded-lg text-left transition-all",
                            "border",
                            config.weather === option.label
                              ? "border-[var(--color-zhusha)] bg-[var(--color-zhusha)]/5"
                              : "border-[var(--color-yanzhi)] hover:border-[var(--color-danyan)]"
                          )}
                        >
                          <div className="font-medium text-[var(--color-moshui)]">
                            {option.label}
                          </div>
                          <div className="text-small text-[var(--color-danyan)] mt-0.5">
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

          {/* 6. 光影质感 */}
          <section id="light" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-qingdai)]">陆</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">光影质感</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  光线的质感特征，可多选叠加
                </p>
              </div>
            </div>
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

          {/* 7. 绘画风格 */}
          <section id="paint" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-qingdai)]">柒</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">绘画风格</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  画面的绘制风格/质感
                </p>
              </div>
            </div>
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

          {/* 8. 构图重点 */}
          <section id="focus" className="scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-2xl text-[var(--color-zhusha)]">捌</span>
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">构图重点</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  画面想要突出表现的主体
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {focuses.map((focus) => (
                <EmotionCard
                  key={focus.id}
                  label={focus.label}
                  description={focus.description}
                  useCase={
                    focus.id === "space"
                      ? "推荐场景展示"
                      : focus.id === "person"
                      ? "推荐人物故事"
                      : focus.id === "balanced"
                      ? "推荐生活记录"
                      : "推荐细节表达"
                  }
                  selected={config.focus === focus.label}
                  onClick={() => handleSingleSelect("focus", focus.label)}
                />
              ))}
            </div>
          </section>

          {/* 补充描述 */}
          <section>
            <div className="flex items-baseline gap-3 mb-6">
              <Brush className="w-6 h-6 text-[var(--color-qingdai)]" />
              <div>
                <h3 className="text-subtitle text-[var(--color-moshui)]">补充描述</h3>
                <p className="text-small text-[var(--color-danyan)] mt-1">
                  更多细节，如人物动作、特定物品、氛围要求
                </p>
              </div>
            </div>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="在这里写下你想补充的细节..."
              className="input-xuanzhi min-h-[120px] resize-y"
            />
          </section>

          {/* 分隔线 */}
          <div className="divider-moxian" />

          {/* Submit */}
          <div className="text-center">
            {!canSubmit && (
              <p className="text-small text-[var(--color-danyan)] mb-4">
                请完成所有必填项（标有红色数字的区块）
              </p>
            )}
            <button
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              className={cn(
                "inline-flex items-center gap-2 px-10 py-4 rounded-full text-lg font-medium transition-all",
                canSubmit && !loading
                  ? "btn-zhusha"
                  : "bg-[var(--color-shuiyin)] text-[var(--color-danyan)] cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <span className="loading-mo">
                    <span />
                    <span />
                    <span />
                  </span>
                  创作中...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  生成四幅候选图
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 返回顶部按钮 */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed right-6 bottom-6 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40",
          "bg-[var(--color-yuebai)] text-[var(--color-qingdai)] border border-[var(--color-yanzhi)]",
          "hover:bg-[var(--color-qingdai)] hover:text-white hover:border-[var(--color-qingdai)]",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="返回顶部"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
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
        "p-5 rounded-xl border text-left transition-all duration-300",
        "bg-[var(--color-yuebai)]",
        selected
          ? "border-[var(--color-zhusha)] shadow-[0_0_0_1px_var(--color-zhusha)]"
          : "border-[var(--color-yanzhi)] hover:border-[var(--color-danyan)]"
      )}
    >
      <div className={cn(
        "font-serif text-lg mb-2 transition-colors",
        selected ? "text-[var(--color-zhusha)]" : "text-[var(--color-moshui)]"
      )}>
        {label}
      </div>
      <div className="text-small text-[var(--color-huise)] mb-3">
        {description}
      </div>
      <div className="text-caption text-[var(--color-danyan)]">
        {useCase}
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
        "flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200",
        "bg-[var(--color-yuebai)]",
        selected
          ? "border-[var(--color-qingdai)] bg-[var(--color-qingdai)]/5"
          : "border-[var(--color-yanzhi)] hover:border-[var(--color-danyan)]"
      )}
    >
      <div
        className={cn(
          "mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
          selected
            ? "bg-[var(--color-qingdai)] border-[var(--color-qingdai)]"
            : "border-[var(--color-yanzhi)]"
        )}
      >
        {selected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-body block",
          selected ? "text-[var(--color-moshui)]" : "text-[var(--color-huise)]"
        )}>
          {label}
        </span>
        {description && (
          <span className="text-small text-[var(--color-danyan)] mt-1 block">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}

// 导入组件
import { ArchitecturalSelector } from "@/components/ui/architectural-selector";
import { RegionSelector } from "@/components/ui/region-selector";
import { SpaceInput } from "@/components/ui/space-input";
