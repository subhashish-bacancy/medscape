import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getModuleById } from "@/lib/training";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { moduleId: rawModuleId } = await params;
  const moduleId = Number(rawModuleId);

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  const trainingModule = await getModuleById(moduleId, user.id);

  if (!trainingModule) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  return NextResponse.json({
    module: {
      id: trainingModule.id,
      title: trainingModule.title,
    },
    questions: trainingModule.quizzes.map(
      (quiz: { id: number; question: string; options: string[] }) => ({
        id: quiz.id,
        question: quiz.question,
        options: quiz.options,
      }),
    ),
  });
}
