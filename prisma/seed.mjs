import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.trainingProgress.deleteMany();
  await prisma.programCertificate.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.trainingModule.deleteMany();

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@medscape.com",
    },
    update: {
      name: "Admin User",
      role: "ADMIN",
      isDisabled: false,
    },
    create: {
      name: "Admin User",
      email: "admin@medscape.com",
      password: hashPassword("Admin@123456"),
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log(`✅ Admin user ready: ${admin.email}`);

  const modules = [
    {
      title: "HIPAA Privacy Basics",
      description:
        "A short compliance module covering what HIPAA protects, who must comply, and what to do when a breach is discovered.",
      videoUrl: "https://www.youtube.com/embed/3l2oi-X8P38",
      quizzes: [
        {
          question: "What does HIPAA protect?",
          options: [
            "Financial records",
            "Patient health information",
            "Hospital buildings",
            "Medical equipment",
          ],
          correctAnswer: "Patient health information",
        },
        {
          question: "Who must comply with HIPAA?",
          options: [
            "Healthcare organizations",
            "Patients",
            "Pharmacies only",
            "Insurance agents only",
          ],
          correctAnswer: "Healthcare organizations",
        },
        {
          question: "What should you do if a data breach occurs?",
          options: [
            "Ignore it",
            "Report immediately",
            "Delete records",
            "Shut down system",
          ],
          correctAnswer: "Report immediately",
        },
      ],
    },
    {
      title: "HIPAA Security Rule Fundamentals",
      description:
        "Understanding administrative, technical, and physical safeguards required by HIPAA.",
      videoUrl: "https://www.youtube.com/embed/2R6kX5BqR9M",
      quizzes: [
        {
          question: "Which safeguard category includes workforce training policies?",
          options: [
            "Administrative safeguards",
            "Technical safeguards",
            "Physical safeguards",
            "Financial safeguards",
          ],
          correctAnswer: "Administrative safeguards",
        },
        {
          question: "What is a technical safeguard example?",
          options: [
            "Locked server room door",
            "Role-based access controls",
            "Staff attendance sheet",
            "Visitor parking pass",
          ],
          correctAnswer: "Role-based access controls",
        },
        {
          question: "Physical safeguards primarily protect:",
          options: [
            "Billing workflows",
            "Clinical staffing levels",
            "Facilities and devices",
            "Insurance claims",
          ],
          correctAnswer: "Facilities and devices",
        },
      ],
    },
    {
      title: "Patient Data Protection & PHI Handling",
      description:
        "Best practices for protecting Protected Health Information (PHI).",
      videoUrl: "https://www.youtube.com/embed/9h9wStdPkQY",
      quizzes: [
        {
          question: "What is the minimum necessary standard?",
          options: [
            "Share all PHI with all staff",
            "Access only PHI needed for the task",
            "Store PHI on personal devices",
            "Discuss PHI in public spaces",
          ],
          correctAnswer: "Access only PHI needed for the task",
        },
        {
          question: "How should paper records with PHI be disposed?",
          options: [
            "Recycled in open bins",
            "Left at nurses station",
            "Shredded in secure disposal",
            "Taken home for filing",
          ],
          correctAnswer: "Shredded in secure disposal",
        },
        {
          question: "When emailing PHI externally, you should:",
          options: [
            "Use encrypted approved channels",
            "Use personal email if faster",
            "Remove patient name only",
            "Send and delete immediately",
          ],
          correctAnswer: "Use encrypted approved channels",
        },
      ],
    },
    {
      title: "Healthcare Data Breach Response",
      description:
        "Steps healthcare workers must take when a potential data breach occurs.",
      videoUrl: "https://www.youtube.com/embed/Skf6tF2xX5E",
      quizzes: [
        {
          question: "What is the first action after suspecting a breach?",
          options: [
            "Post details in team chat",
            "Report to compliance/security immediately",
            "Wait for manager to notice",
            "Delete all related files",
          ],
          correctAnswer: "Report to compliance/security immediately",
        },
        {
          question: "Why is rapid breach reporting important?",
          options: [
            "It prevents all legal obligations",
            "It enables timely containment and notification",
            "It avoids documenting the incident",
            "It removes patient communication needs",
          ],
          correctAnswer: "It enables timely containment and notification",
        },
        {
          question: "During a breach review, staff should:",
          options: [
            "Alter records to reduce impact",
            "Preserve evidence and document facts",
            "Communicate details to social media",
            "Disable all systems permanently",
          ],
          correctAnswer: "Preserve evidence and document facts",
        },
      ],
    },
    {
      title: "Workplace Harassment & Professional Conduct",
      description:
        "Maintaining professional standards and respectful communication in healthcare environments.",
      videoUrl: "https://www.youtube.com/embed/Jk6QH9F5U0Y",
      quizzes: [
        {
          question: "Professional conduct in clinical teams requires:",
          options: [
            "Respectful communication",
            "Ignoring disruptive behavior",
            "Public criticism of coworkers",
            "Excluding new staff",
          ],
          correctAnswer: "Respectful communication",
        },
        {
          question: "If harassment is observed, staff should:",
          options: [
            "Stay silent to avoid conflict",
            "Report through approved channels",
            "Confront publicly only",
            "Share rumors with peers",
          ],
          correctAnswer: "Report through approved channels",
        },
        {
          question: "A professional response to disagreement is to:",
          options: [
            "Escalate emotionally",
            "Discuss concerns respectfully and document",
            "Refuse collaboration",
            "Ignore patient impact",
          ],
          correctAnswer: "Discuss concerns respectfully and document",
        },
      ],
    },
    {
      title: "Infection Control and Safety Protocols",
      description:
        "Preventing healthcare-associated infections and maintaining safe clinical practices.",
      videoUrl: "https://www.youtube.com/embed/Wv8k1zJ3G7A",
      quizzes: [
        {
          question: "Which practice most reduces infection transmission?",
          options: [
            "Hand hygiene compliance",
            "Reusing single-use PPE",
            "Skipping room disinfection",
            "Delaying isolation precautions",
          ],
          correctAnswer: "Hand hygiene compliance",
        },
        {
          question: "When should PPE be changed?",
          options: [
            "Only at end of shift",
            "Between patient interactions as required",
            "Once per day",
            "Only when visibly torn",
          ],
          correctAnswer: "Between patient interactions as required",
        },
        {
          question: "Sharps should be disposed in:",
          options: [
            "Regular trash bins",
            "Sealed medication carts",
            "Approved puncture-resistant containers",
            "Linen bags",
          ],
          correctAnswer: "Approved puncture-resistant containers",
        },
      ],
    },
    {
      title: "Medical Record Documentation Standards",
      description:
        "Best practices for accurate and compliant medical documentation.",
      videoUrl: "https://www.youtube.com/embed/U0QkC2x5P8A",
      quizzes: [
        {
          question: "Compliant documentation should be:",
          options: [
            "Timely, accurate, and complete",
            "Brief and undocumented",
            "Delayed until end of week",
            "Based on memory only",
          ],
          correctAnswer: "Timely, accurate, and complete",
        },
        {
          question: "Late entries in records should:",
          options: [
            "Replace original notes silently",
            "Be clearly labeled with actual entry time",
            "Be backdated to match event time",
            "Omit reason for delay",
          ],
          correctAnswer: "Be clearly labeled with actual entry time",
        },
        {
          question: "Copy-forward documentation is acceptable when:",
          options: [
            "Never reviewed",
            "Reviewed, updated, and clinically relevant",
            "Used to save time regardless of accuracy",
            "Required by billing staff only",
          ],
          correctAnswer: "Reviewed, updated, and clinically relevant",
        },
      ],
    },
  ];

  for (const trainingModule of modules) {
    const createdModule = await prisma.trainingModule.create({
      data: {
        title: trainingModule.title,
        description: trainingModule.description,
        videoUrl: trainingModule.videoUrl,
        quizzes: {
          create: trainingModule.quizzes.map((quiz) => ({
            question: quiz.question,
            options: JSON.stringify(quiz.options),
            correctAnswer: quiz.correctAnswer,
          })),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "MODULE_CREATED",
        entityType: "TrainingModule",
        entityId: createdModule.id,
        metadata: {
          moduleId: createdModule.id,
          title: createdModule.title,
        },
      },
    });
  }

  console.log("✅ 7 modules created with training videos");
  console.log("✅ Quizzes created");
  console.log("✅ Admin audit logs added");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
