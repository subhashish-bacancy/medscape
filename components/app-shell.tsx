import Link from "next/link";
import { Layers, LayoutDashboard, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export function AppShell({
  user,
  title,
  description,
  currentSection = "dashboard",
  children,
}: {
  user: {
    name: string;
    email: string;
    profileImageUrl?: string | null;
    isAdmin?: boolean;
  };
  title: string;
  description: string;
  currentSection?: "dashboard" | "modules" | "admin";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-6 py-6 shadow-md backdrop-blur transition hover:shadow-xl sm:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-[var(--brand)]">
                Healthcare Compliance Training Platform
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-start xl:flex-1 xl:justify-center">
              <nav className="flex items-center gap-2 rounded-xl bg-[var(--panel-strong)] px-2 py-2 shadow-sm ring-1 ring-[var(--border)]">
                <Link
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    currentSection === "dashboard"
                      ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                  }`}
                  href="/dashboard"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    currentSection === "modules"
                      ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                  }`}
                  href="/modules"
                >
                  <Layers className="h-5 w-5" />
                  Modules
                </Link>
                {user.isAdmin ? (
                  <Link
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      currentSection === "admin"
                        ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
                        : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                    }`}
                    href="/admin"
                  >
                    <Shield className="h-5 w-5" />
                    Admin
                  </Link>
                ) : null}
              </nav>
            </div>

            <div className="flex items-center gap-3 xl:flex-1 xl:justify-end">
              <ThemeToggle />
              <UserMenu
                email={user.email}
                isAdmin={user.isAdmin}
                name={user.name}
                profileImageUrl={user.profileImageUrl}
              />
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
