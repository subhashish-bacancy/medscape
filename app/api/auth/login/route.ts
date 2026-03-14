import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

  if (!user || !verifyPassword(password, user.password)) {
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
