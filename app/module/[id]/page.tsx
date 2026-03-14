import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StartQuizButton } from "@/components/start-quiz-button";
import { requireUser } from "@/lib/auth";
import { getModuleById, startTrainingProgress } from "@/lib/training";

function isEmbeddableVideoUrl(videoUrl: string) {
  return videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
}

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const moduleId = Number(id);

  if (Number.isNaN(moduleId)) {
    notFound();
  }

  await startTrainingProgress(user.id, moduleId);
  const trainingModule = await getModuleById(moduleId, user.id);

  if (!trainingModule) {
    notFound();
  }

  return (
    <AppShell
      currentSection="modules"
      description="Review the training content, then start the assessment when you are ready."
      title={trainingModule.title}
      user={user}
    >
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--accent)]/25 px-3 py-1 font-mono text-xs uppercase tracking-[0.24em] text-[var(--brand-dark)]">
              Video lesson
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {trainingModule.quizzes.length} quiz questions
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {trainingModule.description}
          </p>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-black shadow-[0_18px_40px_rgba(23,32,43,0.15)]">
            <div className="aspect-video">
              {isEmbeddableVideoUrl(trainingModule.videoUrl) ? (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                  src={trainingModule.videoUrl}
                  title={trainingModule.title}
                />
              ) : (
                <video
                  className="h-full w-full"
                  controls
                  preload="metadata"
                  src={trainingModule.videoUrl}
                >
                  Your browser does not support the training video.
                </video>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
            <h2 className="text-xl font-semibold">Assessment</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Complete the quiz with a score of 70% or better to mark this
              module complete and issue the certificate automatically.
            </p>

            <div className="mt-6">
              <StartQuizButton moduleId={trainingModule.id} />
            </div>

            {trainingModule.hasCertificate ? (
              <Link
                className="mt-4 inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                href={`/certificate?moduleId=${trainingModule.id}`}
              >
                View certificate
              </Link>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--brand)]">
              Status
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {trainingModule.completed ? "Completed" : "Not completed yet"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {trainingModule.completed
                ? "This module is already marked complete for your account."
                : "Watch the lesson, then submit the quiz to complete the module."}
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
