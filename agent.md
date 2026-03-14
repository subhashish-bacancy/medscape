# AGENT.md

AI coding agent instructions.

Goal: build and maintain a production-ready Healthcare Compliance Training platform.

---

# Core Flow

User registers
User logs in
User watches training
User takes quiz
User passes quiz
Certificate generated

---

# Features

Authentication
Training Modules
Quiz System
Progress Tracking
Certificate Generation
Dashboard

---

# Database Models

User
TrainingModule
Quiz
Progress
Certificate

---

# API Routes

POST /api/auth/register
POST /api/auth/login

GET /api/modules
GET /api/modules/[id]

GET /api/quiz/[moduleId]
POST /api/quiz/submit

POST /api/progress

GET /api/certificate/[moduleId]

---

# Pages

/login
/dashboard
/modules
/module/[id]
/quiz
/certificate

---

# Development Rules

Keep code minimal.

Prefer server actions.

Use Prisma ORM.

Avoid complex architecture.

Hardcode sample training content.

---

# Seed Content

Module:

HIPAA Privacy Basics

Quiz questions:

What does HIPAA protect?
Answer: Patient health information

---

# Coding Priority

1 Authentication
2 Modules
3 Quiz
4 Progress
5 Certificate
6 Dashboard
