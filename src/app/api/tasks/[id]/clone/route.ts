import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/tasks/[id]/clone - 复制项目
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 获取源任务信息
    const sourceTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!sourceTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 2. 创建新任务，复制所有7维配置
    const newTask = await prisma.task.create({
      data: {
        status: "generating_images",
        // 复制7维配置
        coreEmotion: sourceTask.coreEmotion,
        architecturalStyle: sourceTask.architecturalStyle,
        region: sourceTask.region,
        spaceFunction: sourceTask.spaceFunction,
        weather: sourceTask.weather,
        lightingQualities: sourceTask.lightingQualities,
        paintingStyles: sourceTask.paintingStyles,
        description: sourceTask.description,
        // 不复制输出内容（图片、视频等）
        images: null,
        selectedImage: null,
        videoUrl: null,
        title: null,
        content: null,
        tags: null,
      },
    });

    return NextResponse.json({
      task: newTask,
      message: "Task cloned successfully",
    });
  } catch (error) {
    console.error("Failed to clone task:", error);
    return NextResponse.json(
      { error: "Failed to clone task" },
      { status: 500 }
    );
  }
}
