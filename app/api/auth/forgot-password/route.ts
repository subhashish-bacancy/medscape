import { NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = createSupabaseAuthClient();
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const redirectTo = origin ? `${origin.replace(/\/$/, "")}/reset-password` : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("Supabase forgot-password error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      redirectTo,
    });

    const isRedirectError =
      error.message.includes("redirect") || error.message.includes("URL");

    return NextResponse.json(
      {
        error: isRedirectError
          ? "Password reset failed. Add this URL to Supabase Auth Redirect URLs: " +
            (redirectTo ?? "/reset-password")
          : process.env.NODE_ENV === "development"
            ? `Unable to send reset email: ${error.message}`
            : "Unable to send reset email right now. Please try again.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "If an account exists for this email, a password reset link has been sent.",
  });
}
