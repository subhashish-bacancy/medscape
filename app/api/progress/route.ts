import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startTrainingProgress } from "@/lib/training";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { moduleId?: number; completed?: boolean }
    | null;

  const moduleId = Number(body?.moduleId);
  const completed = body?.completed ?? false;

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  const trainingModule = await prisma.trainingModule.findUnique({
    where: { id: moduleId },
    select: { id: true },
  });

  if (!trainingModule) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 });
  }

  const progress = await prisma.progress.upsert({
    where: {
      userId_moduleId: {
        userId: user.id,
        moduleId,
      },
    },
    update: {
      completed,
    },
    create: {
      userId: user.id,
      moduleId,
      completed,
    },
  });

  if (!completed) {
    await startTrainingProgress(user.id, moduleId);
  }

  return NextResponse.json({ progress });
}
