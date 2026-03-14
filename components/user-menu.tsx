"use client";

import Link from "next/link";
import { Award, LogOut, Shield, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";

export function UserMenu({
  name,
  email,
  profileImageUrl,
  isAdmin,
}: {
  name: string;
  email: string;
  profileImageUrl?: string | null;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-left shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/50"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Avatar name={name} profileImageUrl={profileImageUrl} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{name}</p>
          <p className="truncate text-xs text-[var(--muted)]">{email}</p>
        </div>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-56 rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] py-2 shadow-lg ring-1 ring-[var(--border)]">
          <Link
            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--background)]"
            href="/profile"
            onClick={() => setOpen(false)}
          >
            <User className="h-5 w-5 text-[var(--muted)]" />
            Profile
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--background)]"
            href="/dashboard#certificates"
            onClick={() => setOpen(false)}
          >
            <Award className="h-5 w-5 text-[var(--muted)]" />
            Certificates
          </Link>
          {isAdmin ? (
            <Link
              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--background)]"
              href="/admin"
              onClick={() => setOpen(false)}
            >
              <Shield className="h-5 w-5 text-[var(--muted)]" />
              Admin
            </Link>
          ) : null}
          <form action="/api/auth/logout" method="post">
            <button
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[var(--foreground)] transition hover:bg-[var(--background)]"
              type="submit"
            >
              <LogOut className="h-5 w-5 text-[var(--muted)]" />
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
