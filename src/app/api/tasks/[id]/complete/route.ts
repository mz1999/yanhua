import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 即梦 free-api 服务地址
const JIMENG_API_URL = process.env.JIMENG_API_URL || "http://localhost:8000";
const JIMENG_API_KEY = process.env.JIMENG_API_KEY || "";

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
1. 标题（15-20 字，有吸引力）
2. 正文（100-150 字，真情实感）
3. 标签（5-8 个相关标签，带#号）

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

// POST /api/tasks/[id]/complete - 完成创作并生成发布文案
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { imageUrl } = await request.json();

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

    // 2. 生成发布文案
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

    // 3. 更新任务状态为完成
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "completed",
        selectedImage: imageUrl,
        title: publishContent.title,
        content: publishContent.content,
        tags: JSON.stringify(publishContent.tags),
      },
    });

    return NextResponse.json({
      task: updatedTask,
    });
  } catch (error) {
    console.error("Failed to complete task:", error);
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    );
  }
}
