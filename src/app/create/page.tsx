"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/option-card";
import { ArchitecturalSelector } from "@/components/ui/architectural-selector";
import { RegionSelector } from "@/components/ui/region-selector";
import { SpaceInput } from "@/components/ui/space-input";
import {
  coreEmotions,
  spacePresets,
  weatherOptions,
  lightingQualities,
  paintingStyles,
} from "@/lib/config";
import { cn } from "@/lib/utils";
import { ArrowLeft, Wand2, Check, ChevronDown, Cloud, Sun, CloudRain, Snowflake, Moon } from "lucide-react";

// 天气图标映射
const weatherIcons: Record<string, React.ReactNode> = {
  "晴朗": <Sun className="w-5 h-5" />,
  "多云": <Cloud className="w-5 h-5" />,
  "雨天": <CloudRain className="w-5 h-5" />,
  "极端": <Snowflake className="w-5 h-5" />,
  "特殊": <Cloud className="w-5 h-5" />,
  "黄昏/夜晚": <Moon className="w-5 h-5" />,
};

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  // 展开/折叠面板状态
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const canSubmit =
    config.coreEmotion &&
    config.architecturalStyle &&
    config.spaceFunction &&
    config.weather;

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

  const sectionNumber = (num: number) => (
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium">
      {num}
    </span>
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="h-16 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-full flex items-center">
          <Link
            href="/"
            className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>返回</span>
          </Link>
          <h1 className="ml-4 text-lg font-semibold text-[var(--color-text-primary)]">
            新创作
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-h1 mb-3 text-[var(--color-text-primary)]">
            配置你的画面
          </h2>
          <p className="text-body text-[var(--color-text-secondary)]">
            从7个维度组合，创作独特的治愈空间
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
          <div className="pt-6 flex justify-center">
            <Button
              size="lg"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              className="rounded-full px-10"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  创建中...
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
