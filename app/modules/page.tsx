import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireUser } from "@/lib/auth";
import { getModulesWithProgress } from "@/lib/training";

export default async function ModulesPage() {
  const user = await requireUser();
  const modules = await getModulesWithProgress(user.id);

  return (
    <AppShell
      currentSection="modules"
      description="Browse the active compliance modules, launch the video lesson, and move directly into the quiz."
      title="Training modules"
      user={user}
    >
      <div className="grid gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.id} {...module} />
        ))}
      </div>
    </AppShell>
  );
}
