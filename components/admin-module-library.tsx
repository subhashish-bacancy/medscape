"use client";

import Link from "next/link";
import { useState } from "react";
import { PencilLine } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin-delete-button";

type AdminModule = {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  quizzes: Array<{
    id: number;
    question: string;
    correctAnswer: string;
    parsedOptions: string[];
  }>;
};

export function AdminModuleLibrary({ modules }: { modules: AdminModule[] }) {
  const [selectedModuleId, setSelectedModuleId] = useState(
    modules[0]?.id ? String(modules[0].id) : "",
  );

  const selectedModule =
    modules.find((trainingModule) => String(trainingModule.id) === selectedModuleId) ??
    null;

  if (modules.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-md">
        No training modules exist yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Module #{selectedModule.id}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {selectedModule.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {selectedModule.description}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Video: {selectedModule.videoUrl}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Created{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(selectedModule.createdAt)}
                {" · "}
                Updated{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(selectedModule.updatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                href={`/admin/modules/${selectedModule.id}/edit`}
              >
                <PencilLine className="h-4 w-4" />
                Edit
              </Link>
              <AdminDeleteButton
                confirmMessage={`Delete ${selectedModule.title}? This also removes its quizzes and learner links.`}
                endpoint={`/api/admin/modules/${selectedModule.id}`}
                label="Delete"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              Quiz questions for this module
            </p>
            <div className="mt-3 space-y-3">
              {selectedModule.quizzes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No quizzes added to this module yet.
                </p>
              ) : (
                selectedModule.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {quiz.question}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-500">
                      {quiz.parsedOptions.map((option) => (
                        <li key={option}>{option}</li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                        Correct answer: {quiz.correctAnswer}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
