import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks - 获取任务列表
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - 创建任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 言画配置体系 v3 - 8个维度
    const {
      coreEmotion,
      architecturalStyle,
      region,
      spaceFunction,
      weather,
      lightingQualities = [],
      paintingStyles = [],
      focus,
      description,
    } = body;

    const task = await prisma.task.create({
      data: {
        status: "generating_images",
        // 言画配置体系 v3 - 8个维度
        coreEmotion,
        architecturalStyle,
        region,
        spaceFunction,
        weather,
        lightingQualities: JSON.stringify(lightingQualities),
        paintingStyles: JSON.stringify(paintingStyles),
        focus,
        description,
      },
    });

    // TODO: 触发后台图片生成

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
