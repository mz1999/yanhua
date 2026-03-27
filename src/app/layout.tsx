import type { Metadata } from "next";
import "./globals.css";

// 使用系统字体栈，避免构建时下载 Google Fonts
const systemFontStack = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  '"Noto Sans"',
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
].join(",");

const serifFontStack = [
  "Georgia",
  '"Times New Roman"',
  "Times",
  "serif",
].join(",");

export const metadata: Metadata = {
  title: "言画 - 治愈系空间创作",
  description: "以文字为墨，绘心中之境。用诗意配置创作独特的治愈系空间图片。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased"
        style={{
          fontFamily: systemFontStack,
        }}
      >
        <div style={{ fontFamily: serifFontStack }} className="hidden" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
