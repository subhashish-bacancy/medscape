"use client";

import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminQuizForm({
  modules,
  initialValues,
  endpoint,
  method = "POST",
  submitLabel,
  heading,
  description,
  successMessage,
  fixedModuleId,
}: {
  modules: Array<{ id: number; title: string }>;
  initialValues?: {
    moduleId: number;
    question: string;
    options: string[];
    correctAnswer: string;
  };
  endpoint: string;
  method?: "POST" | "PATCH";
  submitLabel: string;
  heading: string;
  description: string;
  successMessage: string;
  fixedModuleId?: number;
}) {
  const router = useRouter();
  const initialOptions = initialValues?.options ?? ["", "", "", ""];
  const [moduleId, setModuleId] = useState(
    fixedModuleId
      ? String(fixedModuleId)
      : initialValues?.moduleId
      ? String(initialValues.moduleId)
      : modules[0]?.id
        ? String(modules[0].id)
        : "",
  );
  const [question, setQuestion] = useState(initialValues?.question ?? "");
  const [options, setOptions] = useState(
    initialOptions.length >= 4
      ? initialOptions
      : [...initialOptions, ...Array.from({ length: 4 - initialOptions.length }, () => "")],
  );
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(
    String(
      Math.max(initialOptions.findIndex((option) => option === initialValues?.correctAnswer), 0),
    ),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const trimmedOptions = options.map((option) => option.trim()).filter(Boolean);
      const correctAnswer = options[Number(correctAnswerIndex)]?.trim() ?? "";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: Number(moduleId),
          question,
          options: trimmedOptions,
          correctAnswer,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to save quiz question.");
        return;
      }

      setSuccess(successMessage);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
      onSubmit={handleSubmit}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {fixedModuleId ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Selected module
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {modules.find((trainingModule) => trainingModule.id === fixedModuleId)
                ?.title ?? "Current module"}
            </p>
          </div>
        ) : (
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Module</span>
            <select
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
              onChange={(event) => setModuleId(event.target.value)}
              required
              value={moduleId}
            >
              {modules.map((trainingModule) => (
                <option key={trainingModule.id} value={trainingModule.id}>
                  {trainingModule.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Question</span>
          <textarea
            className="min-h-24 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            onChange={(event) => setQuestion(event.target.value)}
            required
            value={question}
          />
        </label>

        <div className="grid gap-3">
          <span className="text-sm font-medium text-slate-700">Options</span>
          {options.map((option, index) => (
            <input
              key={index}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
              onChange={(event) =>
                setOptions((current) =>
                  current.map((entry, entryIndex) =>
                    entryIndex === index ? event.target.value : entry,
                  ),
                )
              }
              placeholder={`Option ${index + 1}`}
              required
              value={option}
            />
          ))}
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">
            Correct answer
          </span>
          <select
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            onChange={(event) => setCorrectAnswerIndex(event.target.value)}
            value={correctAnswerIndex}
          >
            {options.map((option, index) => (
              <option key={index} value={index}>
                {option.trim() || `Option ${index + 1}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}

      <button
        className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || modules.length === 0}
        type="submit"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
