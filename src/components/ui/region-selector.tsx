"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X, MapPin } from "lucide-react";
import { regions } from "@/lib/config";

interface RegionSelectorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
}

// 地区图标映射
const regionIcons: Record<string, string> = {
  "中国": "🇨🇳",
  "海外": "🌏",
};

const provinceIcons: Record<string, string> = {
  "华南": "🏝️",
  "华东": "🌊",
  "华北": "🏛️",
  "西南": "⛰️",
  "西北": "🏜️",
  "华中": "🌾",
  "东北": "❄️",
  "日本": "🗾",
  "东南亚": "🌴",
  "欧洲": "🏰",
  "美洲": "🗽",
};

export function RegionSelector({
  value,
  onChange,
  className,
}: RegionSelectorProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  // 查找选中的城市所属的地区
  const findLocation = (city: string) => {
    for (const [country, provinces] of Object.entries(regions)) {
      for (const [province, cities] of Object.entries(provinces)) {
        if (cities.includes(city)) {
          return { country, province, city };
        }
      }
    }
    return null;
  };

  const selectedLocation = value ? findLocation(value) : null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* 已选择显示 */}
      {value && selectedLocation && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-accent)]/10 rounded-lg border border-[var(--color-accent)]/20">
          <MapPin className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-primary)]">
            {selectedLocation.country} · {selectedLocation.province} · {value}
          </span>
          <button
            type="button"
            onClick={() => onChange?.(undefined)}
            className="ml-auto p-1 hover:bg-[var(--color-accent)]/20 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          </button>
        </div>
      )}

      {/* 国家/地区列表 */}
      {!value && (
        <div className="space-y-3">
          {Object.entries(regions).map(([country, provinces]) => (
            <div
              key={country}
              className="border border-[var(--color-border)] rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedCountry(
                    expandedCountry === country ? null : country
                  )
                }
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3",
                  "hover:bg-[#fafafa] transition-colors"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{regionIcons[country] || "🌍"}</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {country}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {Object.values(provinces).flat().length}个城市
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-[var(--color-text-tertiary)] transition-transform",
                    expandedCountry === country && "rotate-180"
                  )}
                />
              </button>

              {expandedCountry === country && (
                <div className="px-4 pb-4 space-y-3">
                  {Object.entries(provinces).map(([province, cities]) => (
                    <div key={province}>
                      <div className="flex items-center gap-1.5 mb-2 text-xs text-[var(--color-text-tertiary)]">
                        <span>{provinceIcons[province] || "📍"}</span>
                        <span>{province}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(cities as string[]).map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => onChange?.(city)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm transition-all border",
                              value === city
                                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)]"
                            )}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
