import Link from "next/link";
import { Activity, BookOpen, CheckCircle2, Clock3, Users } from "lucide-react";
import { getAdminStats, getAuditLogs, requireAdmin } from "@/lib/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [stats, recentLogs] = await Promise.all([
    getAdminStats(),
    getAuditLogs({ page: 1, pageSize: 8 }),
  ]);

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Total Training Modules",
      value: stats.totalTrainingModules,
      icon: BookOpen,
      accent: "bg-slate-100 text-slate-700",
    },
    {
      label: "Completed Trainings",
      value: stats.completedTrainings,
      icon: CheckCircle2,
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Pending Trainings",
      value: stats.pendingTrainings,
      icon: Clock3,
      accent: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest compliance and administration actions captured in the
                audit trail.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {recentLogs.logs.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {entry.action}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {entry.user.name} · {entry.entityType} #{entry.entityId}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(entry.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">Admin Actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jump directly into the most common admin tasks.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              { href: "/admin/modules/create", label: "Create Module" },
              { href: "/admin/quizzes", label: "Manage Quizzes" },
              { href: "/admin/users", label: "Manage Users" },
              { href: "/admin/progress", label: "Review Progress" },
            ].map((item) => (
              <Link
                key={item.href}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
