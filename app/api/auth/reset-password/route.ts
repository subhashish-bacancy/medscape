import { NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseAuthClient } from "@/lib/supabase-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { tokenHash?: string; password?: string }
    | null;

  const tokenHash = body?.tokenHash?.trim();
  const password = body?.password?.trim();

  if (!tokenHash || !password) {
    return NextResponse.json(
      { error: "Reset token and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAuthClient();
  const { data: verificationData, error: verificationError } =
    await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });

  if (verificationError || !verificationData.user?.id) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();
  const { error: updateError } = await admin.auth.admin.updateUserById(
    verificationData.user.id,
    {
      password,
    },
  );

  if (updateError) {
    return NextResponse.json(
      { error: "Unable to reset password. Please request a new reset link." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    message: "Password updated successfully.",
  });
}
