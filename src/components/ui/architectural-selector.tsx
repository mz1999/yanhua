"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { architecturalStyles } from "@/lib/config";

interface ArchitecturalSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

// 地区图标映射
const regionIcons: Record<string, string> = {
  "中国传统": "🏮",
  "日式": "🗾",
  "东南亚": "🌴",
  "欧洲": "🏰",
  "美洲": "🗽",
  "其他": "🌍",
};

export function ArchitecturalSelector({
  value,
  onChange,
  className,
}: ArchitecturalSelectorProps) {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  // 查找当前选中的建筑风格
  const allStyles = Object.values(architecturalStyles).flat();
  const selectedStyle = allStyles.find((s) => s.label === value);

  const selectedRegion = selectedStyle
    ? Object.entries(architecturalStyles).find(([_, styles]) =>
        styles.some((s) => s.label === value)
      )?.[0]
    : null;

  return (
    <div className={cn("space-y-3", className)}>
      {Object.entries(architecturalStyles).map(([region, styles]) => (
        <div
          key={region}
          className="border border-[var(--color-border)] rounded-xl overflow-hidden"
        >
          <button
            type="button"
            onClick={() =>
              setExpandedRegion(
                expandedRegion === region ? null : region
              )
            }
            className={cn(
              "w-full flex items-center justify-between px-4 py-3",
              "hover:bg-[#fafafa] transition-colors"
            )}
          >
            <div className="flex items-center gap-2">
              <span>{regionIcons[region] || "🌍"}</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {region}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {styles.length}种
              </span>
              {selectedRegion === region && (
                <span className="text-xs text-[var(--color-success)]">
                  已选择
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[var(--color-text-tertiary)] transition-transform",
                expandedRegion === region && "rotate-180"
              )}
            />
          </button>

          {expandedRegion === region && (
            <div className="px-4 pb-4 space-y-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onChange?.(style.label)}
                  className={cn(
                    "w-full px-3 py-3 rounded-lg text-left transition-all",
                    "border",
                    value === style.label
                      ? "border-[var(--color-accent)] bg-[#fafafa] shadow-[0_0_0_1px_var(--color-accent)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                  )}
                >
                  <div className="font-medium text-sm text-[var(--color-text-primary)]">
                    {style.label}
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">
                    {style.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
