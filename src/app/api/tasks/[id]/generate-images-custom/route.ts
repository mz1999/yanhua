import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 即梦 free-api 服务地址
const JIMENG_API_URL = process.env.JIMENG_API_URL || "http://localhost:8000";
const JIMENG_API_KEY = process.env.JIMENG_API_KEY || "";

/**
 * 调用即梦 free-api 生成图片
 *
 * 文档: https://github.com/zhizinan1997/jimeng-free-api-all
 * 接口: POST /v1/chat/completions (OpenAI 兼容格式)
 */
async function generateImagesWithJimeng(prompt: string): Promise<string[]> {
  if (!JIMENG_API_KEY) {
    console.log("JIMENG_API_KEY not configured, using mock images");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop",
    ];
  }

  try {
    // 添加 9:16 竖屏比例提示词
    const promptWithRatio = `${prompt}，竖屏构图，9:16比例，适合手机竖屏观看`;

    console.log("Calling Jimeng API with custom prompt:", promptWithRatio);

    const response = await fetch(`${JIMENG_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JIMENG_API_KEY}`,
      },
      body: JSON.stringify({
        model: "jimeng-image-4.5", // 使用 4.5 模型，2K 分辨率
        messages: [
          {
            role: "user",
            content: promptWithRatio,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jimeng API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Jimeng API response:", JSON.stringify(data, null, 2));

    // 解析响应中的图片 URL
    // 根据 free-api 的返回格式，图片 URL 在 choices[0].message.content 中
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in Jimeng API response");
    }

    // 提取图片 URL（支持 Markdown 格式 ![](url) 或纯 URL）
    const imageUrls = extractImageUrls(content);

    if (imageUrls.length === 0) {
      throw new Error("No image URLs found in response");
    }

    return imageUrls;
  } catch (error) {
    console.error("Jimeng API error:", error);
    throw new Error(
      `Failed to generate images: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * 从响应内容中提取图片 URL
 * 支持 Markdown 格式: ![](url) 或 ![alt](url)
 * 也支持纯 URL
 */
function extractImageUrls(content: string): string[] {
  const urls: string[] = [];

  // 匹配 Markdown 图片格式 ![alt](url)
  const markdownRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  while ((match = markdownRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  // 如果没有找到 Markdown 格式，尝试匹配纯 URL
  if (urls.length === 0) {
    const urlRegex = /(https?:\/\/[^\s"'<>\]\)]+\.(?:jpg|jpeg|png|gif|webp))/gi;
    while ((match = urlRegex.exec(content)) !== null) {
      urls.push(match[1]);
    }
  }

  return urls;
}

// POST /api/tasks/[id]/generate-images-custom - 使用自定义提示词生成图片
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 获取请求体中的自定义提示词
    const body = await request.json();
    const { customPrompt } = body;

    if (!customPrompt || typeof customPrompt !== "string") {
      return NextResponse.json(
        { error: "customPrompt is required" },
        { status: 400 }
      );
    }

    // 2. 获取任务信息
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    console.log("Using custom prompt:", customPrompt);

    // 3. 调用即梦 API 生成图片（直接使用自定义提示词，跳过 DeepSeek）
    const imageUrls = await generateImagesWithJimeng(customPrompt);

    // 4. 更新任务状态和图片
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "selecting",
        images: JSON.stringify(imageUrls),
        // 清除之前的选择
        selectedImage: null,
      },
    });

    return NextResponse.json({
      task: updatedTask,
      prompt: customPrompt,
    });
  } catch (error) {
    console.error("Failed to generate images with custom prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
