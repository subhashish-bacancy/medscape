import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { logCertificateDownloaded } from "@/lib/training";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { moduleId?: number }
    | null;
  const moduleId = Number(body?.moduleId);

  if (Number.isNaN(moduleId)) {
    return NextResponse.json({ error: "Invalid module id." }, { status: 400 });
  }

  await logCertificateDownloaded(user.id, moduleId);

  return NextResponse.json({ ok: true });
}
