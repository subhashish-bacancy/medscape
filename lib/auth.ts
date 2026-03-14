import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "hcp_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: number;
  name: string;
  email: string;
  role: UserRole;
  exp: number;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

function toBase64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(input: string) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function signToken(payload: Omit<SessionPayload, "exp">) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify({ ...payload, exp }));
  const signature = toBase64Url(
    createHmac("sha256", getJwtSecret()).update(`${header}.${body}`).digest(),
  );

  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): SessionPayload | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  const expectedSignature = toBase64Url(
    createHmac("sha256", getJwtSecret()).update(`${header}.${body}`).digest(),
  );

  if (expectedSignature !== signature) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(body).toString()) as SessionPayload;

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  const [salt, storedHash] = storedPassword.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (derivedHash.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, storedBuffer);
}

export async function createSession(user: {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}) {
  const token = signToken({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      profileImageUrl: true,
      role: true,
      isDisabled: true,
      createdAt: true,
    },
  });

  if (!user || user.isDisabled) {
    return null;
  }

  return {
    ...user,
    isAdmin: user.role === "ADMIN",
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      profileImageUrl: true,
      role: true,
      isDisabled: true,
      createdAt: true,
    },
  });

  if (!user || user.isDisabled) {
    return null;
  }

  return {
    ...user,
    isAdmin: user.role === "ADMIN",
  };
}
