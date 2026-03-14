import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const PASSING_SCORE = 70;
export const PROGRAM_CERTIFICATE_COURSE_NAME =
  "Healthcare Compliance Training Program";
const DEFAULT_ACTIVITY_LIMIT = 6;

export type ModuleProgressSummary = {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  quizCount: number;
  completed: boolean;
  progressPercentage: number;
  certificateIssuedAt: Date | null;
  hasCertificate: boolean;
  trainingStatus: "not_started" | "in_progress" | "completed";
  trainingScore: number | null;
  attempts: number;
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpentMinutes: number;
};

export type ComplianceActivityItem = {
  id: number;
  title: string;
  description: string;
  timestamp: Date;
};

export type ComplianceDashboardData = {
  modules: ModuleProgressSummary[];
  stats: {
    completedModules: number;
    inProgressModules: number;
    certificatesEarned: number;
  };
  programCertificate: {
    id: number;
    courseName: string;
    issuedAt: Date;
  } | null;
  complianceStatus: {
    completionRate: number;
    lastTrainingDate: string;
    certificatesEarned: number;
  };
  activity: ComplianceActivityItem[];
};

export type ModuleDetail = {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  quizzes: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  completed: boolean;
  progressPercentage: number;
  hasCertificate: boolean;
  trainingStatus: "not_started" | "in_progress" | "completed";
  trainingScore: number | null;
  attempts: number;
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpentMinutes: number;
};

const QUIZ_OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function parseOptions(options: string) {
  return JSON.parse(options) as string[];
}

function isLabeledOption(option: string) {
  return /^[A-F]\s/.test(option);
}

function normalizeQuizOptions(options: string[]) {
  return options.map((option, index) => {
    if (isLabeledOption(option)) {
      return option;
    }

    const label = QUIZ_OPTION_LABELS[index] ?? String(index + 1);
    return `${label} ${option}`;
  });
}

function normalizeCorrectAnswer(options: string[], correctAnswer: string) {
  if (/^[A-F]$/.test(correctAnswer)) {
    return correctAnswer;
  }

  const optionIndex = options.findIndex((option) => {
    if (option === correctAnswer) {
      return true;
    }

    if (isLabeledOption(option)) {
      return option.slice(2) === correctAnswer;
    }

    return false;
  });

  if (optionIndex === -1) {
    return correctAnswer;
  }

  return QUIZ_OPTION_LABELS[optionIndex] ?? correctAnswer;
}

function serializeQuizForClient(quiz: {
  id: number;
  question: string;
  options: string;
  correctAnswer: string;
}) {
  const parsedOptions = parseOptions(quiz.options);
  const normalizedOptions = normalizeQuizOptions(parsedOptions);

  return {
    id: quiz.id,
    question: quiz.question,
    options: normalizedOptions,
    correctAnswer: normalizeCorrectAnswer(parsedOptions, quiz.correctAnswer),
  };
}

function getModuleProgressPercentage(input: {
  completed: boolean;
  trainingStatus: "not_started" | "in_progress" | "completed";
}) {
  if (input.completed || input.trainingStatus === "completed") {
    return 100;
  }

  if (input.trainingStatus === "in_progress") {
    return 50;
  }

  return 0;
}

export async function getModulesWithProgress(
  userId: number,
): Promise<ModuleProgressSummary[]> {
  const modules = await prisma.trainingModule.findMany({
    include: {
      quizzes: {
        orderBy: { id: "asc" },
      },
      progresses: {
        where: { userId },
      },
      trainingProgress: {
        where: { userId },
      },
      certificates: {
        where: { userId },
      },
    },
    orderBy: { id: "asc" },
  });

  return modules.map((trainingModule) => {
    const progress = trainingModule.progresses[0];
    const trainingProgress = trainingModule.trainingProgress[0];
    const certificate = trainingModule.certificates[0];
    const completed = progress?.completed ?? false;
    const trainingStatus = trainingProgress?.status ?? "not_started";

    return {
      id: trainingModule.id,
      title: trainingModule.title,
      description: trainingModule.description,
      videoUrl: trainingModule.videoUrl,
      quizCount: trainingModule.quizzes.length,
      completed,
      progressPercentage: getModuleProgressPercentage({
        completed,
        trainingStatus,
      }),
      certificateIssuedAt: certificate?.issuedAt ?? null,
      hasCertificate: Boolean(certificate),
      trainingStatus,
      trainingScore: trainingProgress?.score ?? null,
      attempts: trainingProgress?.attempts ?? 0,
      startedAt: trainingProgress?.startedAt ?? null,
      completedAt: trainingProgress?.completedAt ?? null,
      timeSpentMinutes: trainingProgress?.timeSpentMinutes ?? 0,
    };
  });
}

export async function getModuleById(
  moduleId: number,
  userId?: number,
): Promise<ModuleDetail | null> {
  if (userId === undefined) {
    const trainingModule = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
      include: {
        quizzes: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!trainingModule) {
      return null;
    }

    return {
      id: trainingModule.id,
      title: trainingModule.title,
      description: trainingModule.description,
      videoUrl: trainingModule.videoUrl,
      quizzes: trainingModule.quizzes.map(serializeQuizForClient),
      completed: false,
      progressPercentage: 0,
      hasCertificate: false,
      trainingStatus: "not_started",
      trainingScore: null,
      attempts: 0,
      startedAt: null,
      completedAt: null,
      timeSpentMinutes: 0,
    };
  }

  const trainingModule = await prisma.trainingModule.findUnique({
    where: { id: moduleId },
    include: {
      quizzes: {
        orderBy: { id: "asc" },
      },
      progresses: {
        where: { userId },
      },
      trainingProgress: {
        where: { userId },
      },
      certificates: {
        where: { userId },
      },
    },
  });

  if (!trainingModule) {
    return null;
  }

  const progress = trainingModule.progresses[0];
  const certificate = trainingModule.certificates[0];
  const trainingProgress = trainingModule.trainingProgress[0];
  const completed = progress?.completed ?? false;
  const trainingStatus = trainingProgress?.status ?? "not_started";

  return {
    id: trainingModule.id,
    title: trainingModule.title,
    description: trainingModule.description,
    videoUrl: trainingModule.videoUrl,
    quizzes: trainingModule.quizzes.map(serializeQuizForClient),
    completed,
    progressPercentage: getModuleProgressPercentage({
      completed,
      trainingStatus,
    }),
    hasCertificate: Boolean(certificate),
    trainingStatus,
    trainingScore: trainingProgress?.score ?? null,
    attempts: trainingProgress?.attempts ?? 0,
    startedAt: trainingProgress?.startedAt ?? null,
    completedAt: trainingProgress?.completedAt ?? null,
    timeSpentMinutes: trainingProgress?.timeSpentMinutes ?? 0,
  };
}

export function calculateQuizScore(
  quizzes: Array<{ id: number; correctAnswer: string }>,
  answers: Record<string, string>,
) {
  if (quizzes.length === 0) {
    return {
      correctCount: 0,
      totalQuestions: 0,
      score: 0,
      passed: false,
    };
  }

  const correctCount = quizzes.reduce((count, quiz) => {
    const selectedAnswer = answers[String(quiz.id)];
    return count + (selectedAnswer === quiz.correctAnswer ? 1 : 0);
  }, 0);

  const score = Math.round((correctCount / quizzes.length) * 100);

  return {
    correctCount,
    totalQuestions: quizzes.length,
    score,
    passed: score >= PASSING_SCORE,
  };
}

export async function issueCertificate(userId: number, moduleId: number) {
  await prisma.progress.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
    update: {
      completed: true,
    },
    create: {
      userId,
      moduleId,
      completed: true,
    },
  });

  const certificate = await prisma.certificate.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
    update: {
      issuedAt: new Date(),
    },
    create: {
      userId,
      moduleId,
    },
  });

  await createAuditLog({
    userId,
    action: "CERTIFICATE_ISSUED",
    entityType: "Certificate",
    entityId: moduleId,
  });

  return certificate;
}

export async function issueProgramCertificateIfEligible(userId: number) {
  const [totalModuleCount, completedModuleCount] = await Promise.all([
    prisma.trainingModule.count(),
    prisma.progress.count({
      where: {
        userId,
        completed: true,
      },
    }),
  ]);

  if (totalModuleCount === 0 || completedModuleCount < totalModuleCount) {
    return null;
  }

  const existingCertificate = await prisma.programCertificate.findUnique({
    where: { userId },
  });

  if (existingCertificate) {
    return existingCertificate;
  }

  const certificate = await prisma.programCertificate.create({
    data: {
      userId,
      courseName: PROGRAM_CERTIFICATE_COURSE_NAME,
    },
  });

  await createAuditLog({
    userId,
    action: "PROGRAM_CERTIFICATE_ISSUED",
    entityType: "ProgramCertificate",
    entityId: certificate.id,
  });

  return certificate;
}

export async function createAuditLog(input: {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: input,
  });
}

export async function startTrainingProgress(userId: number, moduleId: number) {
  const existing = await prisma.trainingProgress.findUnique({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
  });

  if (existing?.status === "completed") {
    return existing;
  }

  const shouldLogStart = !existing || existing.status !== "in_progress";

  const trainingProgress = await prisma.trainingProgress.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId,
      },
    },
    update: {
      status: "in_progress",
      startedAt: new Date(),
    },
    create: {
      userId,
      moduleId,
      status: "in_progress",
      startedAt: new Date(),
    },
  });

  if (shouldLogStart) {
    await createAuditLog({
      userId,
      action: "MODULE_STARTED",
      entityType: "TrainingModule",
      entityId: moduleId,
    });
  }

  return trainingProgress;
}

export async function updateTrainingProgressOnQuiz(input: {
  userId: number;
  moduleId: number;
  score: number;
  passed: boolean;
}) {
  const existing = await prisma.trainingProgress.findUnique({
    where: {
      userId_moduleId: {
        userId: input.userId,
        moduleId: input.moduleId,
      },
    },
  });

  const now = new Date();
  const startedAt = existing?.startedAt ?? now;
  const isAlreadyCompleted = existing?.status === "completed";
  const completed = input.passed || isAlreadyCompleted;
  const timeSpentMinutes = Math.max(
    1,
    Math.round((now.getTime() - startedAt.getTime()) / 60000),
  );

  const trainingProgress = await prisma.trainingProgress.upsert({
    where: {
      userId_moduleId: {
        userId: input.userId,
        moduleId: input.moduleId,
      },
    },
    update: {
      attempts: { increment: 1 },
      score: input.score,
      status: completed ? "completed" : "in_progress",
      completedAt: completed ? existing?.completedAt ?? now : null,
      timeSpentMinutes,
      startedAt,
    },
    create: {
      userId: input.userId,
      moduleId: input.moduleId,
      startedAt,
      completedAt: completed ? now : null,
      score: input.score,
      attempts: 1,
      timeSpentMinutes,
      status: completed ? "completed" : "in_progress",
    },
  });

  await createAuditLog({
    userId: input.userId,
    action: "QUIZ_COMPLETED",
    entityType: "TrainingModule",
    entityId: input.moduleId,
  });

  return trainingProgress;
}

export async function logCertificateDownloaded(userId: number, moduleId: number) {
  return createAuditLog({
    userId,
    action: "CERTIFICATE_DOWNLOADED",
    entityType: "Certificate",
    entityId: moduleId,
  });
}

export async function logProgramCertificateDownloaded(
  userId: number,
  certificateId: number,
) {
  return createAuditLog({
    userId,
    action: "PROGRAM_CERTIFICATE_DOWNLOADED",
    entityType: "ProgramCertificate",
    entityId: certificateId,
  });
}

function formatRelativeDate(date: Date | null) {
  if (!date) {
    return "No training completed yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export async function getComplianceDashboardData(
  userId: number,
): Promise<ComplianceDashboardData> {
  const [modules, programCertificate, activityLogs] = await Promise.all([
    getModulesWithProgress(userId),
    prisma.programCertificate.findUnique({
      where: { userId },
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: DEFAULT_ACTIVITY_LIMIT,
    }),
  ]);

  const completedModules = modules.filter(
    (trainingModule) => trainingModule.trainingStatus === "completed",
  );
  const inProgressModules = modules.filter(
    (trainingModule) => trainingModule.trainingStatus === "in_progress",
  );
  const certificatesEarned = modules.filter(
    (trainingModule) => trainingModule.hasCertificate,
  );

  const completionRate =
    modules.length === 0
      ? 0
      : Math.round((completedModules.length / modules.length) * 100);

  const lastTrainingDate =
    completedModules
      .map((trainingModule) => trainingModule.completedAt)
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  const moduleTitles = new Map(
    modules.map((trainingModule) => [trainingModule.id, trainingModule.title]),
  );
  const scoreByModule = new Map(
    modules.map((trainingModule) => [trainingModule.id, trainingModule.trainingScore]),
  );

  const activity = activityLogs.map((entry) => {
    const moduleTitle = moduleTitles.get(entry.entityId) ?? "Training module";
    const score = scoreByModule.get(entry.entityId);

    if (entry.action === "MODULE_STARTED") {
      return {
        id: entry.id,
        title: `Started ${moduleTitle}`,
        description: "Training record opened for audit evidence.",
        timestamp: entry.timestamp,
      };
    }

    if (entry.action === "QUIZ_COMPLETED") {
      return {
        id: entry.id,
        title: `Passed quiz for ${moduleTitle}`,
        description:
          score !== null && score !== undefined
            ? `Quiz completed with a score of ${score}%.`
            : "Quiz completed and score recorded.",
        timestamp: entry.timestamp,
      };
    }

    if (entry.action === "CERTIFICATE_ISSUED") {
      return {
        id: entry.id,
        title: `Issued certificate for ${moduleTitle}`,
        description: "Completion evidence added to the learner record.",
        timestamp: entry.timestamp,
      };
    }

    if (entry.action === "PROGRAM_CERTIFICATE_ISSUED") {
      return {
        id: entry.id,
        title: "Issued full program certificate",
        description:
          "All healthcare compliance modules were completed and recorded.",
        timestamp: entry.timestamp,
      };
    }

    if (entry.action === "PROGRAM_CERTIFICATE_DOWNLOADED") {
      return {
        id: entry.id,
        title: "Downloaded full program certificate",
        description: "Program completion certificate access was recorded.",
        timestamp: entry.timestamp,
      };
    }

    return {
      id: entry.id,
      title: `Downloaded certificate for ${moduleTitle}`,
      description: "Certificate access recorded for compliance evidence.",
      timestamp: entry.timestamp,
    };
  });

  return {
    modules,
    programCertificate,
    stats: {
      completedModules: completedModules.length,
      inProgressModules: inProgressModules.length,
      certificatesEarned: certificatesEarned.length,
    },
    complianceStatus: {
      completionRate,
      lastTrainingDate: formatRelativeDate(lastTrainingDate),
      certificatesEarned: certificatesEarned.length,
    },
    activity,
  };
}
