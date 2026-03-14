"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartQuizButton({ moduleId }: { moduleId: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStart() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId,
          completed: false,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "Unable to launch the quiz.");
        return;
      }

      router.push(`/quiz?moduleId=${moduleId}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        onClick={handleStart}
        type="button"
      >
        {isSubmitting ? "Opening quiz..." : "Start quiz"}
      </button>

      {error ? (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      ) : null}
    </div>
  );
}
