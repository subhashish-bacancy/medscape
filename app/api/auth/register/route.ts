import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getRegistrationRole } from "@/lib/admin-access";
import prisma from "@/lib/prisma";

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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword(password),
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

  return NextResponse.json({ user });
}
