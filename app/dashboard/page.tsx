import Link from "next/link";
import {
  Activity,
  Award,
  CheckCircle,
  Clock3,
  FileBadge2,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireUser } from "@/lib/auth";
import {
  getComplianceDashboardData,
  issueProgramCertificateIfEligible,
} from "@/lib/training";

export default async function DashboardPage() {
  const user = await requireUser();
  await issueProgramCertificateIfEligible(user.id);
  const dashboardData = await getComplianceDashboardData(user.id);
  const { modules, complianceStatus, activity, programCertificate } = dashboardData;
  const certificates = modules.filter((trainingModule) => trainingModule.hasCertificate);
  const dashboardProgressPercentage =
    modules.length === 0
      ? 0
      : Math.round(
          modules.reduce(
            (total, trainingModule) => total + trainingModule.progressPercentage,
            0,
          ) / modules.length,
        );
  const stats = [
    {
      label: "Modules Completed",
      value: dashboardData.stats.completedModules,
      icon: CheckCircle,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Modules In Progress",
      value: dashboardData.stats.inProgressModules,
      icon: Clock3,
      accent: "bg-slate-100 text-slate-700",
    },
    {
      label: "Certificates Earned",
      value: dashboardData.stats.certificatesEarned,
      icon: Award,
      accent: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <AppShell
      description="Track module completion, resume the current training path, and download certificates without leaving the dashboard."
      title="Compliance dashboard"
      currentSection="dashboard"
      user={user}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
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

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div>
            <h2 className="text-lg font-medium text-slate-900">
              Training modules
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Continue active training and move straight into the quiz.
            </p>
          </div>

          {modules.map((module) => (
            <ModuleCard key={module.id} {...module} />
          ))}
        </div>

        <aside className="space-y-6 xl:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md transition hover:shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Compliance Status</p>
                <h2 className="mt-4 text-lg font-medium text-slate-900">
                  Evidence snapshot
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  A compact audit-friendly view of training completion, latest
                  training activity, and earned certificates.
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Training Completion Rate</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-900">
                  {complianceStatus.completionRate}%
                </dd>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${dashboardProgressPercentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Overall learner progress: {dashboardProgressPercentage}%
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Last Training Date</dt>
                <dd className="mt-2 text-sm font-medium text-slate-900">
                  {complianceStatus.lastTrainingDate}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Certificates Earned</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-900">
                  {complianceStatus.certificatesEarned}
                </dd>
              </div>
            </dl>
          </div>

          <div
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md transition hover:shadow-xl"
            id="certificates"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Certificates</p>
                <h2 className="mt-4 text-lg font-medium text-slate-900">
                  Download from one place
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Once a quiz is passed, a certificate is issued automatically and
                  can be reopened from the dashboard at any time.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {programCertificate ? (
                <Link
                  className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-100 hover:shadow-md"
                  href="/program-certificate"
                >
                  <div>
                    <p className="font-medium">{programCertificate.courseName}</p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Full training program completed
                    </p>
                  </div>
                  <span className="rounded-xl bg-white px-4 py-3 text-xs font-medium text-slate-700 shadow-sm">
                    Download PDF
                  </span>
                </Link>
              ) : null}
              {certificates.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    <FileBadge2 className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    No certificates yet
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Complete a module quiz to unlock a module certificate.
                  </p>
                </div>
              ) : (
                certificates.map((module) => (
                  <Link
                    key={module.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
                    href={`/certificate?moduleId=${module.id}`}
                  >
                    <div>
                      <p className="font-medium">{module.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Certificate available
                      </p>
                    </div>
                    <span className="rounded-xl bg-white px-4 py-3 text-xs font-medium text-slate-700 shadow-sm">
                      Open certificate
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md transition hover:shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Recent Activity</p>
                <h2 className="mt-4 text-lg font-medium text-slate-900">
                  Audit timeline
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Latest learner actions captured for compliance evidence and
                  training verification.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {activity.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No activity recorded yet
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Open a module to begin the learner audit trail.
                  </p>
                </div>
              ) : (
                activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
