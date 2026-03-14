import { ResetPasswordForm } from "@/components/reset-password-form";

type ResetPasswordSearchParams = {
  token_hash?: string;
  type?: string;
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<ResetPasswordSearchParams>;
}) {
  const params = await searchParams;
  const tokenHash = params.token_hash ?? null;
  const isRecoveryType = params.type === "recovery";

  return (
    <div className="login-gradient flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_30px_90px_rgba(23,32,43,0.12)] backdrop-blur sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Reset password</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Set a new password for your account.
        </p>

        <ResetPasswordForm tokenHash={tokenHash} isRecoveryType={isRecoveryType} />
      </div>
    </div>
  );
}
