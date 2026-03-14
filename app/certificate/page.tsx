import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CertificatePreview } from "@/components/certificate-preview";
import { CertificateDownloadButton } from "@/components/certificate-download-button";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function CertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ moduleId?: string }>;
}) {
  const user = await requireUser();
  const { moduleId: rawModuleId } = await searchParams;

  if (!rawModuleId) {
    redirect("/dashboard");
  }

  const moduleId = Number(rawModuleId);

  if (Number.isNaN(moduleId)) {
    redirect("/dashboard");
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
            description: true,
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
    return (
      <AppShell
        currentSection="dashboard"
        description="Certificates appear here as soon as a passing quiz score is recorded."
        title="Certificate unavailable"
        user={user}
      >
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-8 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
          <p className="text-lg text-[var(--muted)]">
            No certificate has been issued for this module yet.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
            href="/modules"
          >
            Return to modules
          </Link>
        </div>
      </AppShell>
    );
  }

  const completionDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(certificate.issuedAt);
  const verificationUrl = `/verify?type=module&certificateId=${certificate.id}`;
  const scoreText =
    trainingProgress?.score === null || trainingProgress?.score === undefined
      ? "N/A"
      : `${trainingProgress.score}%`;

  return (
    <AppShell
      currentSection="dashboard"
      description="This certificate is generated automatically when a learner passes the compliance quiz."
      title="Completion certificate"
      user={user}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <CertificatePreview
          certificateId={`MSC-MOD-${certificate.id}`}
          completionDate={completionDate}
          recipientName={user.name}
          scoreText={scoreText}
          trainingName={certificate.module.title}
          trainingTypeLabel="training module"
          verificationUrl={verificationUrl}
        />

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
            <h3 className="text-xl font-semibold">Certificate details</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-[var(--muted)]">User name</dt>
                <dd className="mt-1 font-semibold">{user.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Module name</dt>
                <dd className="mt-1 font-semibold">{certificate.module.title}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Completion date</dt>
                <dd className="mt-1 font-semibold">{completionDate}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Score</dt>
                <dd className="mt-1 font-semibold">{scoreText}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Certificate ID</dt>
                <dd className="mt-1 font-semibold">{`MSC-MOD-${certificate.id}`}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <CertificateDownloadButton moduleId={moduleId} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
            <p className="text-sm leading-7 text-[var(--muted)]">
              After a passing score is recorded, this certificate is issued
              immediately and can be downloaded as a signed verification PDF.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
