import Link from "next/link";
import prisma from "@/lib/prisma";

type VerifySearchParams = {
  type?: string;
  certificateId?: string;
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<VerifySearchParams>;
}) {
  const params = await searchParams;
  const type = params.type;
  const certificateId = Number(params.certificateId);
  const hasValidParams =
    (type === "module" || type === "program") &&
    params.certificateId &&
    !Number.isNaN(certificateId);

  if (!hasValidParams) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6">
        <div className="w-full rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-8 shadow-[0_24px_70px_rgba(23,32,43,0.1)]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            MedScape Verification
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Invalid verification link</h1>
          <p className="mt-4 text-[var(--muted)]">
            The certificate link is missing required values. Please request a
            fresh certificate PDF from MedScape.
          </p>
        </div>
      </main>
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
      return <NotFoundCard typeLabel="Module certificate" />;
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

    return (
      <VerificationCard
        certificateCode={`MSC-MOD-${certificate.id}`}
        completionDate={certificate.issuedAt}
        recipientName={certificate.user.name}
        score={
          progress?.score === null || progress?.score === undefined
            ? "N/A"
            : `${progress.score}%`
        }
        trainingName={certificate.module.title}
        trainingTypeLabel="Training module"
      />
    );
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
    return <NotFoundCard typeLabel="Program certificate" />;
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

  return (
    <VerificationCard
      certificateCode={`MSC-PROG-${certificate.id}`}
      completionDate={certificate.issuedAt}
      recipientName={certificate.user.name}
      score={
        scoreSummary._avg.score === null || scoreSummary._avg.score === undefined
          ? "N/A"
          : `${Math.round(scoreSummary._avg.score)}%`
      }
      trainingName={certificate.courseName}
      trainingTypeLabel="Training program"
    />
  );
}

function NotFoundCard({ typeLabel }: { typeLabel: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-8 shadow-[0_24px_70px_rgba(23,32,43,0.1)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          MedScape Verification
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{typeLabel} not found</h1>
        <p className="mt-4 text-[var(--muted)]">
          This certificate ID is not valid in MedScape records.
        </p>
      </div>
    </main>
  );
}

function VerificationCard({
  certificateCode,
  completionDate,
  recipientName,
  score,
  trainingName,
  trainingTypeLabel,
}: {
  certificateCode: string;
  completionDate: Date;
  recipientName: string;
  score: string;
  trainingName: string;
  trainingTypeLabel: string;
}) {
  const issuedOn = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(completionDate);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-8 shadow-[0_24px_70px_rgba(23,32,43,0.1)] sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--brand)]">
            MedScape Verification
          </p>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">
            Valid
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Certificate Validated
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          This certificate has been verified against MedScape compliance
          records.
        </p>

        <dl className="mt-8 grid gap-4 rounded-2xl border border-[var(--border)] bg-white/80 p-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">Certificate ID</dt>
            <dd className="mt-1 font-semibold">{certificateCode}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Issued On</dt>
            <dd className="mt-1 font-semibold">{issuedOn}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Recipient</dt>
            <dd className="mt-1 font-semibold">{recipientName}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Score</dt>
            <dd className="mt-1 font-semibold">{score}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--muted)]">{trainingTypeLabel}</dt>
            <dd className="mt-1 font-semibold">{trainingName}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <Link
            className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            href="/"
          >
            Open MedScape
          </Link>
        </div>
      </div>
    </main>
  );
}
