# Healthcare Compliance Training Platform

Production-ready healthcare compliance training platform built with Next.js App Router, Prisma, Supabase (PostgreSQL), TailwindCSS, and JWT auth stored in cookies.

## Features

- Email/password registration and login
- Supabase email verification (required for non-admin users)
- Forgot password + secure reset link flow via Supabase Auth
- Training module listing and detail page
- Quiz flow with automatic scoring
- Progress tracking per user and module
- Certificate issuance after passing score
- Server-generated PDF certificates with QR-based public verification

## Stack

- Next.js (App Router)
- Prisma ORM
- Supabase (PostgreSQL)
- TailwindCSS
- Custom JWT session cookies
- jsPDF (server-side rendering) for certificate generation
- QR code generation for certificate verification

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env
```

3. Run the migration:

```bash
npm run db:migrate -- --name init
```

4. Seed the database:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`

## User Flow

1. Register a user from `/login`
2. Open the HIPAA Privacy Basics module
3. Watch the embedded video and start the quiz
4. Score at least 70%
5. Open the issued certificate and download the PDF

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/modules`
- `GET /api/modules/[id]`
- `GET /api/quiz/[moduleId]`
- `POST /api/quiz/submit`
- `POST /api/progress`
- `GET /api/certificate/[moduleId]`
- `GET /api/certificate/[moduleId]/download`
- `GET /api/program-certificate/[certificateId]/download`
- `GET /api/verify?type=module&certificateId=<id>`
- `GET /api/verify?type=program&certificateId=<id>`

## Project Structure

- `app/`
- `components/`
- `lib/`
- `prisma/`

## Seeded Content

- Training module: `HIPAA Privacy Basics`
- 3 quiz questions with correct answers `B`, `A`, and `B`
- YouTube embed video for the module lesson
