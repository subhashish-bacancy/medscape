import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password?.trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  if (user.isDisabled) {
    return NextResponse.json(
      { error: "This account has been disabled." },
      { status: 403 },
    );
  }

  if (user.role === "ADMIN" && verifyPassword(password, user.password)) {
    await createSession(user);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      },
    });
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("email not confirmed") && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Please verify your email before logging in." },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  if (user.role !== "ADMIN" && !data.user?.email_confirmed_at) {
    return NextResponse.json(
      { error: "Please verify your email before logging in." },
      { status: 403 },
    );
  }

  await createSession(user);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
    },
  });
}
