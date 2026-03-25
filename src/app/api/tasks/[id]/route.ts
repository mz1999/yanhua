import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/[id] - 获取单个任务
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - 更新任务配置
export async function PUT(
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

    // 2. 获取请求体
    const body = await request.json();
    const {
      coreEmotion,
      architecturalStyle,
      region,
      spaceFunction,
      weather,
      lightingQualities,
      paintingStyles,
      description,
      status,
    } = body;

    // 3. 更新任务
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(coreEmotion !== undefined && { coreEmotion }),
        ...(architecturalStyle !== undefined && { architecturalStyle }),
        ...(region !== undefined && { region }),
        ...(spaceFunction !== undefined && { spaceFunction }),
        ...(weather !== undefined && { weather }),
        ...(lightingQualities !== undefined && {
          lightingQualities: Array.isArray(lightingQualities)
            ? JSON.stringify(lightingQualities)
            : lightingQualities,
        }),
        ...(paintingStyles !== undefined && {
          paintingStyles: Array.isArray(paintingStyles)
            ? JSON.stringify(paintingStyles)
            : paintingStyles,
        }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      task: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
