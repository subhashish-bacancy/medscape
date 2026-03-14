import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { buildCompletionCertificatePdf } from "@/lib/certificate-pdf";
import prisma from "@/lib/prisma";
import { logCertificateDownloaded } from "@/lib/training";

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

  const [certificate, trainingProgress] = await Promise.all([
    prisma.certificate.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId,
        },
      },
      include: {
        module: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.trainingProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId,
        },
      },
      select: {
        score: true,
      },
    }),
  ]);

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificate not found." },
      { status: 404 },
    );
  }

  const completionDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(certificate.issuedAt);
  const verificationUrl = `${request.nextUrl.origin}/verify?type=module&certificateId=${certificate.id}`;
  const scoreText =
    trainingProgress?.score === null || trainingProgress?.score === undefined
      ? "N/A"
      : `${trainingProgress.score}%`;
  const certificateId = `MSC-MOD-${certificate.id}`;

  const pdfBuffer = await buildCompletionCertificatePdf({
    recipientName: user.name,
    trainingName: certificate.module.title,
    scoreText,
    trainingTypeLabel: "training module",
    completionDate,
    certificateIdText: certificateId,
    verificationUrl,
  });

  await logCertificateDownloaded(user.id, moduleId);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"certificate-${user.id}-${moduleId}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}
