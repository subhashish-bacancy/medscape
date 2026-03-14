import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="login-gradient flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_30px_90px_rgba(23,32,43,0.12)] backdrop-blur sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Forgot password</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Enter your email and we will send a secure password reset link.
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link className="font-medium text-[var(--brand)] hover:text-[var(--brand-dark)]" href="/login">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
