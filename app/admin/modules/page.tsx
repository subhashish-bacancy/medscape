import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminModuleLibrary } from "@/components/admin-module-library";
import { getAdminModules, requireAdmin } from "@/lib/admin";

export default async function AdminModulesPage() {
  await requireAdmin();
  const modules = await getAdminModules();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Modules</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit, and remove training modules and attached videos.
          </p>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium !text-white transition hover:bg-emerald-700"
          href="/admin/modules/create"
        >
          <Plus className="h-4 w-4" />
          Create module
        </Link>
      </div>

      <AdminModuleLibrary modules={modules} />
    </div>
  );
}
