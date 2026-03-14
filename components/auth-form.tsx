"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthMode = "login" | "register";

export function AuthForm({
  initialSuccessMessage,
}: {
  initialSuccessMessage?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    initialSuccessMessage ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const submitLabel = mode === "login" ? "Login" : "Create account";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Unable to continue.");
        return;
      }

      if (mode === "login") {
        setIsNavigating(true);
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMode("login");
      setName("");
      setPassword("");
      setSuccessMessage(
        data?.message ?? "Account created. Please verify your email before logging in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_30px_90px_rgba(23,32,43,0.12)] backdrop-blur sm:p-8">
      <div className="flex rounded-full border border-[var(--border)] bg-white/90 p-1">
        {(["login", "register"] as const).map((option) => (
          <button
            key={option}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === option
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            onClick={() => {
              setMode(option);
              setError(null);
              setSuccessMessage(null);
            }}
            disabled={isSubmitting || isNavigating}
            type="button"
          >
            {option === "login" ? "Login" : "Register"}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Full name</span>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]"
              onChange={(event) => setName(event.target.value)}
              placeholder="Jordan Fields"
              required
              type="text"
              value={name}
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jordan@hospital.org"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            required
            type="password"
            value={password}
          />
        </label>

        {mode === "login" ? (
          <div className="-mt-1 text-right text-sm">
            <Link
              className="font-medium text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
              href="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {isNavigating ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--brand)]" />
            Redirecting to dashboard...
          </div>
        ) : null}

        <button
          className="w-full rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting || isNavigating}
          type="submit"
        >
          {isNavigating
            ? "Redirecting..."
            : isSubmitting
              ? "Please wait..."
              : submitLabel}
        </button>
      </form>

      {mode === "login" ? (
        <p className="mt-6 text-center text-sm leading-6 text-[var(--muted)]">
          Access compliance training, complete assigned assessments, and keep
          your certification records available in one secure workspace.
        </p>
      ) : null}
    </div>
  );
}
