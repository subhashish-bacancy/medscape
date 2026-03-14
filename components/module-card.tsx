import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";

export function ModuleCard({
  id,
  title,
  description,
  quizCount,
  completed,
  progressPercentage,
  hasCertificate,
  trainingScore,
}: {
  id: number;
  title: string;
  description: string;
  quizCount: number;
  completed: boolean;
  progressPercentage: number;
  hasCertificate: boolean;
  trainingScore: number | null;
}) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-emerald-700">
          Training Module
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            completed
              ? "bg-emerald-100 text-emerald-700"
              : progressPercentage > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {completed
            ? "Completed"
            : progressPercentage > 0
              ? "In progress"
              : "Not started"}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--muted)]">Assessment</p>
            <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
              {quizCount} questions
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Quiz score</p>
            <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
              {trainingScore === null ? "Not attempted" : `${trainingScore}%`}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--muted)]">Certificate</p>
            <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
              {hasCertificate ? "Ready to download" : "Locked"}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">Completion</p>
            <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
              {completed ? "Completed for this user" : "Pending"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[var(--foreground)]">Training progress</p>
          <span className="text-sm text-[var(--muted)]">{progressPercentage}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            href={`/module/${id}`}
          >
            <BookOpen className="h-5 w-5" />
            View module
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium !text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
            href={`/quiz?moduleId=${id}`}
          >
            <PlayCircle className="h-5 w-5" />
            Take quiz
          </Link>
        </div>
      </div>
    </article>
  );
}
