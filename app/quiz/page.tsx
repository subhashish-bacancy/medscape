import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { QuizForm } from "@/components/quiz-form";
import { requireUser } from "@/lib/auth";
import { getModuleById } from "@/lib/training";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ moduleId?: string }>;
}) {
  const user = await requireUser();
  const { moduleId: rawModuleId } = await searchParams;

  if (!rawModuleId) {
    redirect("/modules");
  }

  const moduleId = Number(rawModuleId);

  if (Number.isNaN(moduleId)) {
    notFound();
  }

  const trainingModule = await getModuleById(moduleId, user.id);

  if (!trainingModule) {
    notFound();
  }

  return (
    <AppShell
      currentSection="modules"
      description="Answer every question, submit once, and the system will calculate your score instantly."
      title={`${trainingModule.title} quiz`}
      user={user}
    >
      <QuizForm
        moduleId={trainingModule.id}
        moduleTitle={trainingModule.title}
        questions={trainingModule.quizzes.map(({ id, options, question }) => ({
          id,
          question,
          options,
        }))}
      />
    </AppShell>
  );
}
