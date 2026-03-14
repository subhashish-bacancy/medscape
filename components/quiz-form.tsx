"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
};

type QuizResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  certificateUrl: string | null;
};

const QUIZ_OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

function getOptionPresentation(option: string, index: number) {
  const labeledMatch = option.match(/^([A-F])\s+(.+)$/);

  if (labeledMatch) {
    return {
      key: labeledMatch[1],
      text: labeledMatch[2],
    };
  }

  return {
    key: QUIZ_OPTION_LABELS[index] ?? String(index + 1),
    text: option,
  };
}

export function QuizForm({
  moduleId,
  moduleTitle,
  questions,
}: {
  moduleId: number;
  moduleTitle: string;
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredCount = Object.keys(answers).length;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId,
          answers,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ({ error?: string } & Partial<QuizResult>)
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Unable to submit quiz.");
        return;
      }

      setResult(data as QuizResult);

      if (data?.passed && data.certificateUrl) {
        router.push(data.certificateUrl as string);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <form
        className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-[0_20px_60px_rgba(23,32,43,0.08)]"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--accent)]/25 px-3 py-1 font-mono text-xs uppercase tracking-[0.24em] text-[var(--brand-dark)]">
            Quiz
          </span>
          <p className="text-sm text-[var(--muted)]">{moduleTitle}</p>
        </div>

        <div className="mt-6 space-y-6">
          {questions.map((question, index) => (
            <section
              key={question.id}
              className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                Question {index + 1}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {question.question}
              </h2>

              <div className="mt-4 grid gap-3">
                {question.options.map((option, optionIndex) => {
                  const presentation = getOptionPresentation(option, optionIndex);
                  const optionKey = presentation.key;
                  const isSelected = answers[String(question.id)] === optionKey;

                  return (
                    <label
                      key={`${question.id}-${optionKey}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--brand)]/8"
                          : "border-[var(--border)] bg-white hover:border-[var(--brand)]/40"
                      }`}
                    >
                      <input
                        checked={isSelected}
                        className="h-4 w-4 accent-[var(--brand)]"
                        name={`question-${question.id}`}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: optionKey,
                          }))
                        }
                        type="radio"
                        value={optionKey}
                      />
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {presentation.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        <button
          className="mt-6 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting || answeredCount !== questions.length}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit quiz"}
        </button>
      </form>

      <aside className="space-y-4">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
          <h3 className="text-lg font-semibold">Completion rule</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Answer all {questions.length} questions and score at least 70% to
            mark the module complete and unlock the certificate.
          </p>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Answered</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {answeredCount}/{questions.length}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Status</dt>
              <dd className="mt-1 text-lg font-semibold">
                {answeredCount === questions.length
                  ? "Ready to submit"
                  : "Finish all questions"}
              </dd>
            </div>
          </dl>
        </div>

        {result ? (
          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(23,32,43,0.08)]">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
              Result
            </p>
            <h3 className="mt-2 text-3xl font-semibold">{result.score}%</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {result.correctCount} of {result.totalQuestions} answers correct.
            </p>
            <p
              className={`mt-4 text-sm font-semibold ${
                result.passed ? "text-emerald-700" : "text-[var(--danger)]"
              }`}
            >
              {result.passed
                ? "Passed. Redirecting to your certificate."
                : "Below the passing threshold. Review the module and retry."}
            </p>
            {!result.passed ? (
              <div className="mt-4 flex gap-3">
                <Link
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  href={`/module/${moduleId}`}
                >
                  Review module
                </Link>
                <button
                  className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
                  onClick={() => setResult(null)}
                  type="button"
                >
                  Retry now
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
