"use client";

import { useMemo, useState } from "react";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminQuizForm } from "@/components/admin-quiz-form";

type AdminQuizModule = {
  id: number;
  title: string;
  quizzes: Array<{
    id: number;
    question: string;
    correctAnswer: string;
    parsedOptions: string[];
  }>;
};

export function AdminQuizManager({ modules }: { modules: AdminQuizModule[] }) {
  const [selectedModuleId, setSelectedModuleId] = useState(
    modules[0]?.id ? String(modules[0].id) : "",
  );

  const selectedModule = useMemo(
    () =>
      modules.find((trainingModule) => String(trainingModule.id) === selectedModuleId) ??
      null,
    [modules, selectedModuleId],
  );

  if (modules.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-md">
        No modules available. Create a training module first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">
            Select module
          </span>
          <select
            className="max-w-xl rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
            onChange={(event) => setSelectedModuleId(event.target.value)}
            value={selectedModuleId}
          >
            {modules.map((trainingModule) => (
              <option key={trainingModule.id} value={trainingModule.id}>
                {trainingModule.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedModule ? (
        <>
          <AdminQuizForm
            description="Add a new quiz question directly into the selected module."
            endpoint="/api/admin/quizzes"
            fixedModuleId={selectedModule.id}
            heading={`Add question to ${selectedModule.title}`}
            modules={modules.map((trainingModule) => ({
              id: trainingModule.id,
              title: trainingModule.title,
            }))}
            submitLabel="Add question"
            successMessage="Quiz question created."
          />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Selected module
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {selectedModule.title}
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {selectedModule.quizzes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  No quiz questions created for this module yet.
                </div>
              ) : (
                selectedModule.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            Correct answer
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {quiz.correctAnswer}
                          </p>
                        </div>

                        <AdminQuizForm
                          description="Update the question, options, or correct answer for this module."
                          endpoint={`/api/admin/quizzes/${quiz.id}`}
                          fixedModuleId={selectedModule.id}
                          heading={`Edit question #${quiz.id}`}
                          initialValues={{
                            moduleId: selectedModule.id,
                            question: quiz.question,
                            options: quiz.parsedOptions,
                            correctAnswer: quiz.correctAnswer,
                          }}
                          method="PATCH"
                          modules={modules.map((trainingModule) => ({
                            id: trainingModule.id,
                            title: trainingModule.title,
                          }))}
                          submitLabel="Save question"
                          successMessage="Quiz question updated."
                        />
                      </div>

                      <div className="xl:pt-16">
                        <AdminDeleteButton
                          confirmMessage="Delete this quiz question?"
                          endpoint={`/api/admin/quizzes/${quiz.id}`}
                          label="Delete question"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
