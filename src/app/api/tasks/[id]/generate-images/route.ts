import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImagesWithJimeng } from "@/lib/jimeng";

// 默认使用的即梦模型
const DEFAULT_JIMENG_MODEL = "jimeng-image-4.1";

/**
 * 生成 AI 绘画提示词
 * 调用内部 API 使用 DeepSeek 扩展用户输入
 */
async function generatePrompt(task: {
  coreEmotion: string;
  architecturalStyle: string;
  region?: string | null;
  spaceFunction: string;
  weather: string;
  lightingQualities: string;
  paintingStyles: string;
  focus: string;
  description?: string | null;
}): Promise<string> {
  // 解析 JSON 字段
  const lightingQualities: string[] = task.lightingQualities
    ? JSON.parse(task.lightingQualities)
    : [];
  const paintingStyles: string[] = task.paintingStyles
    ? JSON.parse(task.paintingStyles)
    : [];

  // 构建用户输入描述
  const userInput = [
    task.coreEmotion,
    task.architecturalStyle,
    task.region,
    task.spaceFunction,
    task.weather,
    ...lightingQualities,
    ...paintingStyles,
    task.focus,
    task.description,
  ]
    .filter(Boolean)
    .join("，");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/generate-prompt`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput,
          coreEmotion: task.coreEmotion,
          architecturalStyle: task.architecturalStyle,
          region: task.region,
          spaceFunction: task.spaceFunction,
          weather: task.weather,
          lightingQualities,
          paintingStyles,
          focus: task.focus,
          description: task.description,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate prompt");
    }

    const data = await response.json();
    return data.prompt;
  } catch (error) {
    console.error("Prompt generation failed:", error);
    // 降级方案：直接拼接
    return buildFallbackPrompt(task, lightingQualities, paintingStyles);
  }
}

/**
 * 构建降级提示词
 */
function buildFallbackPrompt(
  task: {
    coreEmotion: string;
    architecturalStyle: string;
    region?: string | null;
    spaceFunction: string;
    weather: string;
    focus: string;
    description?: string | null;
  },
  lightingQualities: string[],
  paintingStyles: string[]
): string {
  const parts: string[] = [];

  // 核心情绪
  parts.push(`${task.coreEmotion}风格`);

  // 绘画风格
  if (paintingStyles.length > 0) {
    parts.push(paintingStyles.join("、"));
  }

  // 建筑和地域
  if (task.region) {
    parts.push(`${task.region}的${task.architecturalStyle}`);
  } else {
    parts.push(task.architecturalStyle);
  }

  // 空间功能
  parts.push(task.spaceFunction);

  // 天气
  parts.push(task.weather);

  // 光影
  if (lightingQualities.length > 0) {
    parts.push(lightingQualities.join("、"));
  }

  // 构图重点
  parts.push(task.focus);

  // 补充描述
  if (task.description) {
    parts.push(task.description);
  }

  parts.push("高清细节，电影质感，治愈氛围");

  return parts.join("，");
}

// POST /api/tasks/[id]/generate-images - 生成图片
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 获取任务信息
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 2. 生成绘画提示词
    const prompt = await generatePrompt({
      coreEmotion: task.coreEmotion,
      architecturalStyle: task.architecturalStyle,
      region: task.region,
      spaceFunction: task.spaceFunction,
      weather: task.weather,
      lightingQualities: task.lightingQualities,
      paintingStyles: task.paintingStyles,
      focus: task.focus,
      description: task.description,
    });

    console.log("Generated prompt:", prompt);

    // 3. 调用即梦 API 生成图片（使用默认模型）
    const imageUrls = await generateImagesWithJimeng(prompt, DEFAULT_JIMENG_MODEL);

    // 4. 更新任务状态和图片，清除之前的选择
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "completed",
        images: JSON.stringify(imageUrls),
        selectedImage: null,
      },
    });

    return NextResponse.json({
      task: updatedTask,
      prompt,
    });
  } catch (error) {
    console.error("Failed to generate images:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
