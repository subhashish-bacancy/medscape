import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { buildCompletionCertificatePdf } from "@/lib/certificate-pdf";
import prisma from "@/lib/prisma";
import { logProgramCertificateDownloaded } from "@/lib/training";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> },
) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { certificateId: rawCertificateId } = await params;
  const certificateId = Number(rawCertificateId);

  if (Number.isNaN(certificateId)) {
    return NextResponse.json(
      { error: "Invalid certificate id." },
      { status: 400 },
    );
  }

  const [certificate, scoreSummary] = await Promise.all([
    prisma.programCertificate.findFirst({
      where: {
        id: certificateId,
        userId: user.id,
      },
    }),
    prisma.trainingProgress.aggregate({
      where: {
        userId: user.id,
        status: "completed",
        score: {
          not: null,
        },
      },
      _avg: {
        score: true,
      },
    }),
  ]);

  if (!certificate) {
    return NextResponse.json(
      { error: "Program certificate not found." },
      { status: 404 },
    );
  }

  const completionDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(certificate.issuedAt);
  const averageScore =
    scoreSummary._avg.score === null || scoreSummary._avg.score === undefined
      ? "N/A"
      : `${Math.round(scoreSummary._avg.score)}%`;
  const verificationUrl = `${request.nextUrl.origin}/verify?type=program&certificateId=${certificate.id}`;
  const pdfCertificateId = `MSC-PROG-${certificate.id}`;

  const pdfBuffer = await buildCompletionCertificatePdf({
    recipientName: user.name,
    trainingName: certificate.courseName,
    scoreText: averageScore,
    trainingTypeLabel: "training program",
    completionDate,
    certificateIdText: pdfCertificateId,
    verificationUrl,
  });

  await logProgramCertificateDownloaded(user.id, certificate.id);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"certificate-${user.id}-${certificate.id}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}
