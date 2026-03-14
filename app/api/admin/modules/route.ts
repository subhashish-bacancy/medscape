import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createModule } from "@/lib/admin";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { title?: string; description?: string; videoUrl?: string }
    | null;

  try {
    const trainingModule = await createModule(user.id, {
      title: body?.title ?? "",
      description: body?.description ?? "",
      videoUrl: body?.videoUrl ?? "",
    });

    return NextResponse.json({ module: trainingModule }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create module.",
      },
      { status: 400 },
    );
  }
}
