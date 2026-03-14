import { AdminQuizManager } from "@/components/admin-quiz-manager";
import { getAdminModules, requireAdmin } from "@/lib/admin";

export default async function AdminQuizzesPage() {
  await requireAdmin();
  const modules = await getAdminModules();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-semibold text-slate-900">Quizzes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a module, review only that module&apos;s questions, and add new
          questions directly into it.
        </p>
      </div>

      <AdminQuizManager modules={modules} />
    </div>
  );
}
