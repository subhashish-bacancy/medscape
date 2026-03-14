import { getAdminModules, getAdminUsers, getTrainingProgress, requireAdmin } from "@/lib/admin";

export default async function AdminProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; moduleId?: string; status?: string }>;
}) {
  await requireAdmin();
  const { userId, moduleId, status } = await searchParams;
  const [users, modules, progress] = await Promise.all([
    getAdminUsers(),
    getAdminModules(),
    getTrainingProgress({
      userId: userId ? Number(userId) : undefined,
      moduleId: moduleId ? Number(moduleId) : undefined,
      status:
        status === "not_started" || status === "in_progress" || status === "completed"
          ? status
          : "all",
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900">
          Training Progress
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor completion status, quiz scores, and learner progress across
          modules.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-4" method="get">
          <select
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            defaultValue={userId ?? ""}
            name="userId"
          >
            <option value="">All users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            defaultValue={moduleId ?? ""}
            name="moduleId"
          >
            <option value="">All modules</option>
            {modules.map((trainingModule) => (
              <option key={trainingModule.id} value={trainingModule.id}>
                {trainingModule.title}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
            defaultValue={status ?? "all"}
            name="status"
          >
            <option value="all">All statuses</option>
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>

          <button
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--brand)] hover:bg-[var(--panel-strong)] hover:text-[var(--brand)]"
            type="submit"
          >
            Apply filters
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">User Name</th>
                <th className="px-4 py-3 font-medium">Module Name</th>
                <th className="px-4 py-3 font-medium">Completion Status</th>
                <th className="px-4 py-3 font-medium">Quiz Score</th>
                <th className="px-4 py-3 font-medium">Completion Date</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {entry.user.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{entry.module.title}</td>
                  <td className="px-4 py-4 text-slate-600">{entry.status}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {entry.score === null ? "N/A" : `${entry.score}%`}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {entry.completedAt
                      ? new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(entry.completedAt)
                      : "Not completed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
