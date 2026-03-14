import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteModule, updateModule } from "@/lib/admin";
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
  const moduleId = Number(id);
  const body = (await request.json().catch(() => null)) as
    | { title?: string; description?: string; videoUrl?: string }
    | null;

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  try {
    const trainingModule = await updateModule(user.id, moduleId, {
      title: body?.title ?? "",
      description: body?.description ?? "",
      videoUrl: body?.videoUrl ?? "",
    });

    return NextResponse.json({ module: trainingModule });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update module.",
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
  const moduleId = Number(id);

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  try {
    await deleteModule(user.id, moduleId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete module.",
      },
      { status: 400 },
    );
  }
}
