import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createQuiz } from "@/lib/admin";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        moduleId?: number;
        question?: string;
        options?: string[];
        correctAnswer?: string;
      }
    | null;

  try {
    const quiz = await createQuiz(user.id, {
      moduleId: Number(body?.moduleId),
      question: body?.question ?? "",
      options: body?.options ?? [],
      correctAnswer: body?.correctAnswer ?? "",
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create quiz question.",
      },
      { status: 400 },
    );
  }
}
