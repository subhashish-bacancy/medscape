import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getModuleById } from "@/lib/training";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const moduleId = Number(id);

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  const trainingModule = await getModuleById(moduleId, user.id);

  if (!trainingModule) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 });
  }

  return NextResponse.json({
    module: {
      ...trainingModule,
      quizzes: trainingModule.quizzes.map(
        (quiz: { id: number; question: string; options: string[] }) => ({
          id: quiz.id,
          question: quiz.question,
          options: quiz.options,
        }),
      ),
    },
  });
}
