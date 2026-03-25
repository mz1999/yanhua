import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 即梦 free-api 服务地址
const JIMENG_API_URL = process.env.JIMENG_API_URL || "http://localhost:8000";
const JIMENG_API_KEY = process.env.JIMENG_API_KEY || "";

/**
 * 调用即梦 free-api 生成视频
 *
 * 使用图片作为首帧生成视频，自动配乐
 * 文档: https://github.com/zhizinan1997/jimeng-free-api-all
 *
 * @param imageUrl 首帧图片 URL
 * @param duration 视频时长（5秒或10秒）
 */
async function generateVideoWithJimeng(imageUrl: string, duration: number = 5): Promise<string> {
  if (!JIMENG_API_KEY) {
    console.log("JIMENG_API_KEY not configured, using mock video");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return "https://example.com/mock-video.mp4";
  }

  try {
    console.log("Calling Jimeng video API with image:", imageUrl);

    // 构建提示词，包含时长和比例信息
    const prompt = `基于这张图片生成${duration}秒的竖屏视频，9:16比例，动态自然流畅，适合手机竖屏观看`;

    const response = await fetch(`${JIMENG_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JIMENG_API_KEY}`,
      },
      body: JSON.stringify({
        model: "jimeng-video-3.0", // 使用 3.0 模型
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jimeng video API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Jimeng video API response:", JSON.stringify(data, null, 2));

    // 解析响应中的视频 URL
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in Jimeng video API response");
    }

    // 提取视频 URL
    const videoUrl = extractVideoUrl(content);

    if (!videoUrl) {
      throw new Error("No video URL found in response");
    }

    return videoUrl;
  } catch (error) {
    console.error("Jimeng video API error:", error);
    throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * 从响应内容中提取视频 URL
 */
function extractVideoUrl(content: string): string | null {
  // 匹配 Markdown 视频格式
  const markdownRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/;
  const markdownMatch = content.match(markdownRegex);
  if (markdownMatch) {
    return markdownMatch[1];
  }

  // 匹配纯 URL（视频格式）
  const urlRegex = /(https?:\/\/[^\s"'<>\]\)]+\.(?:mp4|mov|webm))/i;
  const urlMatch = content.match(urlRegex);
  if (urlMatch) {
    return urlMatch[1];
  }

  // 如果都没匹配到，返回整个内容（可能是纯 URL）
  const trimmed = content.trim();
  if (trimmed.startsWith("http")) {
    return trimmed;
  }

  return null;
}

/**
 * 生成发布文案（使用 DeepSeek）
 */
async function generatePublishContent(task: {
  coreEmotion: string;
  architecturalStyle: string;
  region?: string | null;
  spaceFunction: string;
  weather: string;
  lightingQualities: string;
  paintingStyles: string;
  description?: string | null;
}): Promise<{ title: string; content: string; tags: string[] }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  // 解析 JSON 字段
  const lightingQualities: string[] = task.lightingQualities
    ? JSON.parse(task.lightingQualities)
    : [];
  const paintingStyles: string[] = task.paintingStyles
    ? JSON.parse(task.paintingStyles)
    : [];

  if (!apiKey || apiKey === "your-deepseek-api-key") {
    // 返回模拟数据
    return {
      title: "温馨治愈的家居时光，这就是我向往的生活",
      content: "在这个快节奏的世界里，找到属于自己的宁静角落是多么珍贵。一杯热茶，一本好书，阳光透过窗户洒在地板上，时间仿佛慢了下来。这就是生活本该有的样子。",
      tags: ["#治愈系", "#家居生活", "#慢生活", "#生活美学", "#温馨小窝"],
    };
  }

  try {
    const styleDesc = [task.coreEmotion, ...paintingStyles].join("、");
    const locationDesc = task.region
      ? `${task.region}的${task.architecturalStyle}`
      : task.architecturalStyle;

    const prompt = `根据以下内容生成小红书风格的发布文案：
核心情绪：${task.coreEmotion}
绘画风格：${paintingStyles.join("、") || "精细漫画"}
建筑风格：${task.architecturalStyle}
地域：${task.region || "未指定"}
空间功能：${task.spaceFunction}
天气/氛围：${task.weather}
光影质感：${lightingQualities.join("、") || "自然光"}
补充描述：${task.description || "无"}

请生成：
1. 标题（15-20字，有吸引力）
2. 正文（100-150字，真情实感）
3. 标签（5-8个相关标签，带#号）

用 JSON 格式输出：{"title": "...", "content": "...", "tags": ["#tag1", ...]}`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    // 解析 JSON
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }

    throw new Error("Failed to parse content");
  } catch (error) {
    console.error("Content generation failed:", error);
    return {
      title: "温馨治愈的家居时光",
      content: "找到属于自己的宁静角落，享受慢生活的美好。",
      tags: ["#治愈系", "#生活美学"],
    };
  }
}

// POST /api/tasks/[id]/generate-video - 生成视频
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { imageUrl, duration = 5 } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    // 1. 获取任务信息
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // 2. 调用即梦 API 生成视频
    const videoUrl = await generateVideoWithJimeng(imageUrl, duration);

    // 3. 生成发布文案
    const publishContent = await generatePublishContent({
      coreEmotion: task.coreEmotion,
      architecturalStyle: task.architecturalStyle,
      region: task.region,
      spaceFunction: task.spaceFunction,
      weather: task.weather,
      lightingQualities: task.lightingQualities,
      paintingStyles: task.paintingStyles,
      description: task.description,
    });

    // 4. 更新任务状态
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "completed",
        selectedImage: imageUrl,
        videoUrl: videoUrl,
        title: publishContent.title,
        content: publishContent.content,
        tags: JSON.stringify(publishContent.tags),
      },
    });

    return NextResponse.json({
      task: updatedTask,
    });
  } catch (error) {
    console.error("Failed to generate video:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
