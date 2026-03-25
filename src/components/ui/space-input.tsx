"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SpaceInputProps {
  value: string;
  onChange: (value: string) => void;
  presets: readonly string[];
  placeholder?: string;
  className?: string;
}

export function SpaceInput({
  value,
  onChange,
  presets,
  placeholder = "输入空间功能，如'社区咖啡馆'、'阁楼画室'...",
  className,
}: SpaceInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭焦点
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (preset: string) => {
    onChange(preset);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={className}>
      {/* 输入框 */}
      <div
        className={cn(
          "relative flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
          "bg-[var(--color-surface)]",
          isFocused
            ? "border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-[var(--color-surface-hover)] text-[var(--color-text-tertiary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 快捷标签 */}
      <div className="mt-3">
        <p className="text-xs text-[var(--color-text-tertiary)] mb-2">快捷选择：</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-all border",
                value === preset
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
