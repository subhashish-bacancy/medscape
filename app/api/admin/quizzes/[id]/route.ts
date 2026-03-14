import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteQuiz, updateQuiz } from "@/lib/admin";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromRequest(request);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const quizId = Number(id);
  const body = (await request.json().catch(() => null)) as
    | {
        moduleId?: number;
        question?: string;
        options?: string[];
        correctAnswer?: string;
      }
    | null;

  if (Number.isNaN(quizId)) {
    return NextResponse.json({ error: "Invalid quiz id." }, { status: 400 });
  }

  try {
    const quiz = await updateQuiz(user.id, quizId, {
      moduleId: Number(body?.moduleId),
      question: body?.question ?? "",
      options: body?.options ?? [],
      correctAnswer: body?.correctAnswer ?? "",
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update quiz question.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromRequest(request);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const quizId = Number(id);

  if (Number.isNaN(quizId)) {
    return NextResponse.json({ error: "Invalid quiz id." }, { status: 400 });
  }

  try {
    await deleteQuiz(user.id, quizId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete quiz.",
      },
      { status: 400 },
    );
  }
}
