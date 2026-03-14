import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const rawCertificateId = request.nextUrl.searchParams.get("certificateId");
  const certificateId = Number(rawCertificateId);

  if (
    (type !== "module" && type !== "program") ||
    !rawCertificateId ||
    Number.isNaN(certificateId)
  ) {
    return NextResponse.json(
      { error: "Invalid verification parameters." },
      { status: 400 },
    );
  }

  if (type === "module") {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        {
          valid: false,
          type,
          certificateId,
          reason: "Certificate not found.",
        },
        { status: 404 },
      );
    }

    const progress = await prisma.trainingProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: certificate.userId,
          moduleId: certificate.moduleId,
        },
      },
      select: {
        score: true,
      },
    });

    return NextResponse.json({
      valid: true,
      type,
      certificateId: `MSC-MOD-${certificate.id}`,
      issuedAt: certificate.issuedAt,
      recipient: certificate.user.name,
      trainingName: certificate.module.title,
      moduleId: certificate.module.id,
      score:
        progress?.score === null || progress?.score === undefined
          ? null
          : progress.score,
    });
  }

  const certificate = await prisma.programCertificate.findUnique({
    where: { id: certificateId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!certificate) {
    return NextResponse.json(
      {
        valid: false,
        type,
        certificateId,
        reason: "Program certificate not found.",
      },
      { status: 404 },
    );
  }

  const scoreSummary = await prisma.trainingProgress.aggregate({
    where: {
      userId: certificate.userId,
      status: "completed",
      score: {
        not: null,
      },
    },
    _avg: {
      score: true,
    },
  });

  return NextResponse.json({
    valid: true,
    type,
    certificateId: `MSC-PROG-${certificate.id}`,
    issuedAt: certificate.issuedAt,
    recipient: certificate.user.name,
    trainingName: certificate.courseName,
    score:
      scoreSummary._avg.score === null || scoreSummary._avg.score === undefined
        ? null
        : Math.round(scoreSummary._avg.score),
  });
}
