import type { UserRole } from "@prisma/client";

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getRegistrationRole(input: {
  email: string;
  adminCount: number;
}): UserRole {
  if (input.adminCount === 0 || isAdminEmail(input.email)) {
    return "ADMIN";
  }

  return "USER";
}
