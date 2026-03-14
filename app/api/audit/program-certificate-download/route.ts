import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { logProgramCertificateDownloaded } from "@/lib/training";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { certificateId?: number }
    | null;
  const certificateId = Number(body?.certificateId);

  if (Number.isNaN(certificateId)) {
    return NextResponse.json({ error: "Invalid certificate id." }, { status: 400 });
  }

  const certificate = await prisma.programCertificate.findFirst({
    where: {
      id: certificateId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!certificate) {
    return NextResponse.json(
      { error: "Program certificate not found." },
      { status: 404 },
    );
  }

  await logProgramCertificateDownloaded(user.id, certificate.id);

  return NextResponse.json({ ok: true });
}
