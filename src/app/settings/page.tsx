"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);

  const copyEnvExample = () => {
    const content = `DATABASE_URL="file:./dev.db"
DEEPSEEK_API_KEY=your-api-key-here
JIMENG_API_URL=http://localhost:8000
JIMENG_API_KEY=your-jimeng-session-id-here
LLM_API_URL=https://api.siliconflow.cn/v1/chat/completions
LLM_MODEL=deepseek-ai/DeepSeek-V3.2`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            配置指南
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-10">
          {/* Intro */}
          <section className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
            <h2 className="text-h3 mb-3 text-[var(--color-text-primary)]">开始使用</h2>
            <p className="text-body text-[var(--color-text-secondary)]">
              言画需要配置两个 AI 服务才能正常工作。请在项目根目录创建
              <code className="px-1.5 py-0.5 bg-[var(--color-bg)] rounded text-sm font-mono">.env</code>
              文件，填入以下配置。
            </p>
          </section>

          {/* Quick Config */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 text-[var(--color-text-primary)]">快速配置</h2>
              <button
                onClick={copyEnvExample}
                className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制配置模板
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-gray-300">
{`DATABASE_URL="file:./dev.db"
DEEPSEEK_API_KEY=your-api-key-here
JIMENG_API_URL=http://localhost:8000
JIMENG_API_KEY=your-jimeng-session-id-here
LLM_API_URL=https://api.siliconflow.cn/v1/chat/completions
LLM_MODEL=deepseek-ai/DeepSeek-V3.2`}
              </pre>
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-tertiary)]">
              复制以上内容到项目根目录的 <code className="font-mono">.env</code> 文件
            </p>
          </section>

          {/* DeepSeek Config */}
          <section>
            <h2 className="text-h2 mb-4 text-[var(--color-text-primary)]">1. 提示词生成 API 配置</h2>
            <p className="text-body text-[var(--color-text-secondary)] mb-4">
              用于将你的 8 维配置（情绪、风格、天气等）转化为专业的 AI 绘画提示词。
              支持 DeepSeek 官方 API 或硅基流动（SiliconFlow）代理服务。
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium flex-shrink-0">1</span>
                <div>
                  <p className="text-[var(--color-text-primary)]">选择 API 服务商</p>
                  <div className="mt-2 space-y-2">
                    <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)]">
                      <p className="font-medium text-[var(--color-text-primary)]">方案 A：DeepSeek 官方（推荐国内用户）</p>
                      <a
                        href="https://platform.deepseek.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline mt-1"
                      >
                        platform.deepseek.com
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)]">
                      <p className="font-medium text-[var(--color-text-primary)]">方案 B：硅基流动 SiliconFlow（默认）</p>
                      <a
                        href="https://siliconflow.cn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline mt-1"
                      >
                        siliconflow.cn
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        默认使用，无需额外配置 URL
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium flex-shrink-0">2</span>
                <p className="text-[var(--color-text-primary)]">注册账号并登录</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium flex-shrink-0">3</span>
                <p className="text-[var(--color-text-primary)]">
                  进入「API Keys」页面，创建新密钥并复制
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium flex-shrink-0">4</span>
                <p className="text-[var(--color-text-primary)]">
                  将密钥填入 <code className="font-mono text-sm bg-[var(--color-surface)] px-1.5 py-0.5 rounded">DEEPSEEK_API_KEY</code>
                </p>
              </div>
            </div>

            {/* Advanced LLM Config */}
            <div className="mt-6 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
              <h3 className="font-medium text-[var(--color-text-primary)] mb-2">高级配置（可选）</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                默认使用硅基流动服务，如需使用官方 DeepSeek API 或其他兼容 OpenAI 的服务，可修改：
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-[var(--color-bg)] px-2 py-1 rounded">LLM_API_URL</code>
                  <span className="text-[var(--color-text-tertiary)]">
                    API 端点地址，默认：https://api.siliconflow.cn/v1/chat/completions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-[var(--color-bg)] px-2 py-1 rounded">LLM_MODEL</code>
                  <span className="text-[var(--color-text-tertiary)]">
                    模型名称，默认：deepseek-ai/DeepSeek-V3.2
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Jimeng Config */}
          <section>
            <h2 className="text-h2 mb-4 text-[var(--color-text-primary)]">2. 即梦 API 配置</h2>
            <p className="text-body text-[var(--color-text-secondary)] mb-4">
              用于根据提示词生成图片。需要本地部署即梦 free-api 服务。
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium flex-shrink-0">1</span>
                <div>
                  <p className="text-[var(--color-text-primary)]">部署 jimeng-free-api-all</p>
                  <a
                    href="https://github.com/zhizinan1997/jimeng-free-api-all"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline mt-1"
                  >
                    查看部署文档
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium flex-shrink-0">2</span>
                <p className="text-[var(--color-text-primary)]">
                  启动服务后，访问 <code className="font-mono text-sm bg-[var(--color-surface)] px-1.5 py-0.5 rounded">http://localhost:8001</code> 获取 sessionid
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-medium flex-shrink-0">3</span>
                <p className="text-[var(--color-text-primary)]">
                  将 sessionid 填入 <code className="font-mono text-sm bg-[var(--color-surface)] px-1.5 py-0.5 rounded">JIMENG_API_KEY</code>
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)]">
            <h2 className="text-h3 mb-4 text-[var(--color-text-primary)]">常见问题</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)] mb-1">配置后需要重启吗？</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  是的，修改 .env 文件后需要重启 Next.js 开发服务器（npm run dev）才能生效。
                </p>
              </div>

              <div>
                <h3 className="font-medium text-[var(--color-text-primary)] mb-1">不配置会有什么效果？</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  系统会使用预设的示例图片，方便你体验流程，但无法生成自定义内容。
                </p>
              </div>

              <div>
                <h3 className="font-medium text-[var(--color-text-primary)] mb-1">API Key 安全吗？</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  .env 文件不会提交到 git（已添加到 .gitignore），仅本地使用，请勿分享给他人。
                </p>
              </div>
            </div>
          </section>

          {/* Back */}
          <div className="pt-6 border-t border-[var(--color-border)]">
            <Link href="/">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
