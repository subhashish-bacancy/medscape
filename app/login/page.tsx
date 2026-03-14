import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

type LoginPageSearchParams = {
  verified?: string;
  reset?: string;
  reset_email?: string;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginPageSearchParams>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  let initialSuccessMessage: string | null = null;

  if (params.verified === "1") {
    initialSuccessMessage = "Email verified. You can now log in.";
  } else if (params.reset_email === "sent") {
    initialSuccessMessage = "Password reset email sent. Please check your inbox.";
  } else if (params.reset === "success") {
    initialSuccessMessage = "Password reset successful. Please log in with your new password.";
  }

  return (
    <div className="login-gradient flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 font-mono text-xs uppercase tracking-[0.35em] text-[var(--brand)] shadow-sm">
            MedScape
          </div>

          <div className="max-w-2xl">
            <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              Train teams fast. Prove compliance faster.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
              A minimal full-stack training platform where staff complete a
              HIPAA module, pass a quiz, and instantly receive a completion
              certificate.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Watch the module"],
              ["2", "Pass the quiz"],
              ["3", "Download the certificate"],
            ].map(([step, label]) => (
              <div
                key={step}
                className="rounded-[1.75rem] border border-[var(--border)] bg-white/75 p-5 shadow-[0_16px_40px_rgba(23,32,43,0.08)]"
              >
                <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
                  Step {step}
                </p>
                <p className="mt-3 text-center text-lg font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center lg:justify-end">
          <AuthForm initialSuccessMessage={initialSuccessMessage} />
        </div>
      </div>
    </div>
  );
}
