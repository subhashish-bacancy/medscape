import { Shield } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin-sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Admin
              </p>
              <h1 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                Training Control
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Manage compliance content, learner roles, training progress, and
            audit evidence from one place.
          </p>

          <div className="mt-6">
            <AdminSidebarNav />
          </div>
        </aside>

        <div className="space-y-6">
          <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--panel-strong)] px-6 py-5 shadow-md sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Healthcare Compliance Platform</p>
              <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                Administration
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu
                email={user.email}
                isAdmin
                name={user.name}
                profileImageUrl={user.profileImageUrl}
              />
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
