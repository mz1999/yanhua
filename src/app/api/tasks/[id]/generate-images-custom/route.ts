import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImagesWithJimeng } from "@/lib/jimeng";

// 默认使用的即梦模型
const DEFAULT_JIMENG_MODEL = "jimeng-image-4.1";

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
    const imageUrls = await generateImagesWithJimeng(customPrompt, DEFAULT_JIMENG_MODEL);

    // 4. 更新任务状态、图片和提示词
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "completed",
        images: JSON.stringify(imageUrls),
        // 清除之前的选择
        selectedImage: null,
        prompt: customPrompt,
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
