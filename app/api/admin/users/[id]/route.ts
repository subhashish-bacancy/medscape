import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import { updateUserDisabledState, updateUserRole } from "@/lib/admin";
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
  const userId = Number(id);
  const body = (await request.json().catch(() => null)) as
    | { role?: UserRole; isDisabled?: boolean }
    | null;

  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  if (body?.role && body.role !== "USER" && body.role !== "ADMIN") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  if (userId === user.id && body?.isDisabled) {
    return NextResponse.json(
      { error: "You cannot disable your own admin account." },
      { status: 400 },
    );
  }

  if (userId === user.id && body?.role && body.role !== user.role) {
    return NextResponse.json(
      { error: "You cannot change your own admin role." },
      { status: 400 },
    );
  }

  if (!body?.role && typeof body?.isDisabled !== "boolean") {
    return NextResponse.json(
      { error: "No user update provided." },
      { status: 400 },
    );
  }

  try {
    let updatedUser = null;

    if (body?.role) {
      updatedUser = await updateUserRole(user.id, userId, body.role);
    }

    if (typeof body?.isDisabled === "boolean") {
      updatedUser = await updateUserDisabledState(user.id, userId, body.isDisabled);
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update user.",
      },
      { status: 400 },
    );
  }
}
