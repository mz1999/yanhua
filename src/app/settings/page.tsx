"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
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
            设置
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* API Settings */}
          <section>
            <h2 className="text-h2 mb-6 text-[var(--color-text-primary)]">API 配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  即梦 API Key
                </label>
                <input
                  type="password"
                  placeholder="输入你的即梦 API Key"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
                />
                <p className="mt-1.5 text-sm text-[var(--color-text-tertiary)]">
                  用于生成图片和视频
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  DeepSeek API Key
                </label>
                <input
                  type="password"
                  placeholder="输入你的 DeepSeek API Key"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
                />
                <p className="mt-1.5 text-sm text-[var(--color-text-tertiary)]">
                  用于生成发布文案
                </p>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="pt-6 border-t border-[var(--color-border)]">
            <Button>保存设置</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
