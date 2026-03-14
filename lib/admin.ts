import { redirect } from "next/navigation";
import type { Prisma, TrainingProgressStatus, UserRole } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAuditLog, parseOptions } from "@/lib/training";

type ModuleInput = {
  title: string;
  description: string;
  videoUrl: string;
};

type QuizInput = {
  moduleId: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}

function assertNonEmpty(value: string, fieldName: string) {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }
}

function normalizeModuleInput(input: ModuleInput) {
  assertNonEmpty(input.title, "Title");
  assertNonEmpty(input.description, "Description");
  assertNonEmpty(input.videoUrl, "Video URL");

  return {
    title: input.title.trim(),
    description: input.description.trim(),
    videoUrl: input.videoUrl.trim(),
  };
}

function normalizeQuizInput(input: QuizInput) {
  if (Number.isNaN(input.moduleId)) {
    throw new Error("A valid training module is required.");
  }

  assertNonEmpty(input.question, "Question");

  const options = input.options.map((option) => option.trim()).filter(Boolean);
  const correctAnswer = input.correctAnswer.trim();

  if (options.length < 2) {
    throw new Error("At least two quiz options are required.");
  }

  if (!correctAnswer) {
    throw new Error("Correct answer is required.");
  }

  if (!options.includes(correctAnswer)) {
    throw new Error("Correct answer must match one of the provided options.");
  }

  return {
    moduleId: input.moduleId,
    question: input.question.trim(),
    options,
    correctAnswer,
  };
}

export async function createModule(actorUserId: number, input: ModuleInput) {
  const normalized = normalizeModuleInput(input);

  const trainingModule = await prisma.trainingModule.create({
    data: normalized,
  });

  await createAuditLog({
    userId: actorUserId,
    action: "MODULE_CREATED",
    entityType: "TrainingModule",
    entityId: trainingModule.id,
    metadata: normalized,
  });

  return trainingModule;
}

export async function updateModule(
  actorUserId: number,
  moduleId: number,
  input: ModuleInput,
) {
  const normalized = normalizeModuleInput(input);

  const trainingModule = await prisma.trainingModule.update({
    where: { id: moduleId },
    data: normalized,
  });

  await createAuditLog({
    userId: actorUserId,
    action: "MODULE_UPDATED",
    entityType: "TrainingModule",
    entityId: trainingModule.id,
    metadata: normalized,
  });

  return trainingModule;
}

export async function deleteModule(actorUserId: number, moduleId: number) {
  const trainingModule = await prisma.trainingModule.delete({
    where: { id: moduleId },
  });

  await createAuditLog({
    userId: actorUserId,
    action: "MODULE_DELETED",
    entityType: "TrainingModule",
    entityId: moduleId,
    metadata: {
      title: trainingModule.title,
    },
  });

  return trainingModule;
}

export async function createQuiz(actorUserId: number, input: QuizInput) {
  const normalized = normalizeQuizInput(input);
  const moduleExists = await prisma.trainingModule.findUnique({
    where: { id: normalized.moduleId },
    select: { id: true },
  });

  if (!moduleExists) {
    throw new Error("Training module not found.");
  }

  const quiz = await prisma.quiz.create({
    data: {
      moduleId: normalized.moduleId,
      question: normalized.question,
      options: JSON.stringify(normalized.options),
      correctAnswer: normalized.correctAnswer,
    },
  });

  await createAuditLog({
    userId: actorUserId,
    action: "QUIZ_CREATED",
    entityType: "Quiz",
    entityId: quiz.id,
    metadata: {
      moduleId: normalized.moduleId,
      question: normalized.question,
      options: normalized.options,
      correctAnswer: normalized.correctAnswer,
    },
  });

  return quiz;
}

export async function updateQuiz(
  actorUserId: number,
  quizId: number,
  input: QuizInput,
) {
  const normalized = normalizeQuizInput(input);
  const moduleExists = await prisma.trainingModule.findUnique({
    where: { id: normalized.moduleId },
    select: { id: true },
  });

  if (!moduleExists) {
    throw new Error("Training module not found.");
  }

  const quiz = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      moduleId: normalized.moduleId,
      question: normalized.question,
      options: JSON.stringify(normalized.options),
      correctAnswer: normalized.correctAnswer,
    },
  });

  await createAuditLog({
    userId: actorUserId,
    action: "QUIZ_UPDATED",
    entityType: "Quiz",
    entityId: quiz.id,
    metadata: {
      moduleId: normalized.moduleId,
      question: normalized.question,
      options: normalized.options,
      correctAnswer: normalized.correctAnswer,
    },
  });

  return quiz;
}

export async function deleteQuiz(actorUserId: number, quizId: number) {
  const quiz = await prisma.quiz.delete({
    where: { id: quizId },
  });

  await createAuditLog({
    userId: actorUserId,
    action: "QUIZ_DELETED",
    entityType: "Quiz",
    entityId: quizId,
    metadata: {
      moduleId: quiz.moduleId,
      question: quiz.question,
    },
  });

  return quiz;
}

export async function updateUserRole(
  actorUserId: number,
  userId: number,
  role: UserRole,
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
      name: true,
    },
  });

  await createAuditLog({
    userId: actorUserId,
    action: "USER_ROLE_UPDATED",
    entityType: "User",
    entityId: userId,
    metadata: {
      role,
      email: user.email,
    },
  });

  return user;
}

export async function updateUserDisabledState(
  actorUserId: number,
  userId: number,
  isDisabled: boolean,
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isDisabled },
    select: {
      id: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
      name: true,
    },
  });

  await createAuditLog({
    userId: actorUserId,
    action: isDisabled ? "USER_DISABLED" : "USER_ENABLED",
    entityType: "User",
    entityId: userId,
    metadata: {
      email: user.email,
      isDisabled,
    },
  });

  return user;
}

export async function getAdminStats() {
  const [totalUsers, totalTrainingModules, completedTrainings, activeUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.trainingModule.count(),
      prisma.trainingProgress.count({
        where: {
          status: "completed",
        },
      }),
      prisma.user.count({
        where: {
          isDisabled: false,
        },
      }),
    ]);

  const pendingTrainings = Math.max(
    activeUsers * totalTrainingModules - completedTrainings,
    0,
  );

  return {
    totalUsers,
    totalTrainingModules,
    completedTrainings,
    pendingTrainings,
  };
}

export async function getTrainingProgress(filters?: {
  userId?: number;
  moduleId?: number;
  status?: TrainingProgressStatus | "all";
}) {
  const where: Prisma.TrainingProgressWhereInput = {};

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.moduleId) {
    where.moduleId = filters.moduleId;
  }

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  return prisma.trainingProgress.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      module: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [{ completedAt: "desc" }, { startedAt: "desc" }, { id: "desc" }],
  });
}

export async function getAuditLogs(input?: {
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(input?.page ?? 1, 1);
  const pageSize = Math.min(Math.max(input?.pageSize ?? 20, 1), 100);
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function getAdminModules() {
  const modules = await prisma.trainingModule.findMany({
    include: {
      quizzes: {
        orderBy: { id: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return modules.map((trainingModule) => ({
    ...trainingModule,
    quizzes: trainingModule.quizzes.map((quiz) => ({
      ...quiz,
      parsedOptions: parseOptions(quiz.options),
    })),
  }));
}

export async function getAdminModuleById(moduleId: number) {
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
    ...trainingModule,
    quizzes: trainingModule.quizzes.map((quiz) => ({
      ...quiz,
      parsedOptions: parseOptions(quiz.options),
    })),
  };
}

export async function getAdminUsers(search?: string) {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
    },
    where: search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}
