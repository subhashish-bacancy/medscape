generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
}

model User {
id       String @id @default(cuid())
name     String
email    String @unique
password String
}

model TrainingModule {
id          String @id @default(cuid())
title       String
description String
videoUrl    String
}

model Quiz {
id            String @id @default(cuid())
moduleId      String
question      String
options       String
correctAnswer String
}

model Progress {
id        String @id @default(cuid())
userId    String
moduleId  String
completed Boolean
}

model Certificate {
id        String @id @default(cuid())
userId    String
moduleId  String
issuedAt  DateTime @default(now())
}
