import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  calculateQuizScore,
  getModuleById,
  issueCertificate,
  issueProgramCertificateIfEligible,
  updateTrainingProgressOnQuiz,
} from "@/lib/training";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { moduleId?: number; answers?: Record<string, string> }
    | null;

  const moduleId = Number(body?.moduleId);
  const answers = body?.answers ?? {};

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  const trainingModule = await getModuleById(moduleId, user.id);

  if (!trainingModule || trainingModule.quizzes.length === 0) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  const result = calculateQuizScore(trainingModule.quizzes, answers);
  await updateTrainingProgressOnQuiz({
    userId: user.id,
    moduleId,
    score: result.score,
    passed: result.passed,
  });

  if (result.passed) {
    await issueCertificate(user.id, moduleId);
    await issueProgramCertificateIfEligible(user.id);
  } else {
    await prisma.progress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId,
        },
      },
      update: {
        completed: trainingModule.completed,
      },
      create: {
        userId: user.id,
        moduleId,
        completed: false,
      },
    });
  }

  return NextResponse.json({
    ...result,
    moduleId,
    certificateUrl: result.passed ? `/certificate?moduleId=${moduleId}` : null,
  });
}
