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

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return NextResponse.json({
    message: "If an account exists for this email, a password reset link has been sent.",
  });
}
