import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CertificatePreview } from "@/components/certificate-preview";
import { ProgramCertificateDownloadButton } from "@/components/program-certificate-download-button";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { issueProgramCertificateIfEligible } from "@/lib/training";

export default async function ProgramCertificatePage() {
  const user = await requireUser();
  await issueProgramCertificateIfEligible(user.id);

  const certificate = await prisma.programCertificate.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!certificate) {
    redirect("/dashboard");
  }

  const completionDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(certificate.issuedAt);
  const scoreSummary = await prisma.trainingProgress.aggregate({
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
  });
  const scoreText =
    scoreSummary._avg.score === null || scoreSummary._avg.score === undefined
      ? "N/A"
      : `${Math.round(scoreSummary._avg.score)}%`;
  const verificationUrl = `/verify?type=program&certificateId=${certificate.id}`;

  return (
    <AppShell
      currentSection="dashboard"
      description="This certificate is issued automatically after all required healthcare compliance modules are completed."
      title="Program certificate"
      user={user}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <CertificatePreview
          certificateId={`MSC-PROG-${certificate.id}`}
          completionDate={completionDate}
          recipientName={user.name}
          scoreText={scoreText}
          trainingName={certificate.courseName}
          trainingTypeLabel="training program"
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
                <dt className="text-[var(--muted)]">Course name</dt>
                <dd className="mt-1 font-semibold">{certificate.courseName}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Completion date</dt>
                <dd className="mt-1 font-semibold">{completionDate}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Average score</dt>
                <dd className="mt-1 font-semibold">{scoreText}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Certificate ID</dt>
                <dd className="mt-1 font-semibold">{`MSC-PROG-${certificate.id}`}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <ProgramCertificateDownloadButton certificateId={certificate.id} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
            <p className="text-sm leading-7 text-[var(--muted)]">
              This certificate is generated once all assigned training modules
              are complete and can be downloaded any time from the dashboard.
            </p>
            <Link
              className="mt-6 inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              href="/dashboard"
            >
              Return to dashboard
            </Link>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
