import Link from "next/link";
import { getAuditLogs, requireAdmin } from "@/lib/admin";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const pageNumber = page ? Number(page) : 1;
  const auditLogs = await getAuditLogs({
    page: Number.isNaN(pageNumber) ? 1 : pageNumber,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review the full compliance activity history with paginated log
          records.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="space-y-3">
          {auditLogs.logs.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {entry.action}
                  </p>
                  <p className="text-sm text-slate-500">
                    {entry.user.name} ({entry.user.email})
                  </p>
                  <p className="text-sm text-slate-500">
                    {entry.entityType} #{entry.entityId}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(entry.timestamp)}
                  </p>
                </div>

                <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">Metadata</p>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {entry.metadata
                      ? JSON.stringify(entry.metadata, null, 2)
                      : "No metadata"}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {auditLogs.page} of {auditLogs.totalPages}
          </p>

          <div className="flex gap-2">
            <Link
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                auditLogs.page <= 1
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
              href={`/admin/audit-logs?page=${Math.max(auditLogs.page - 1, 1)}`}
            >
              Previous
            </Link>
            <Link
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                auditLogs.page >= auditLogs.totalPages
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
              href={`/admin/audit-logs?page=${Math.min(
                auditLogs.page + 1,
                auditLogs.totalPages,
              )}`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
