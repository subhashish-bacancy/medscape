import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getRegistrationRole } from "@/lib/admin-access";
import prisma from "@/lib/prisma";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; email?: string; password?: string }
    | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password?.trim();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const adminCount = await prisma.user.count({
    where: { role: "ADMIN" },
  });
  const role = getRegistrationRole({ email, adminCount });

  const supabase = createSupabaseAuthClient();
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const emailRedirectTo = origin ? `${origin.replace(/\/$/, "")}/login?verified=1` : undefined;

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (signUpError) {
    const message = signUpError.message.toLowerCase();
    if (message.includes("already") || message.includes("registered")) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to register account right now. Please try again." },
      { status: 502 },
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword(randomBytes(32).toString("hex")),
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImageUrl: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    user,
    message: "Account created. Please verify your email before logging in.",
  });
}
