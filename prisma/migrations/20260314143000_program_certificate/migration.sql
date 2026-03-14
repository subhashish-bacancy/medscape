CREATE TABLE "ProgramCertificate" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgramCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProgramCertificate_userId_key" ON "ProgramCertificate"("userId");

ALTER TABLE "ProgramCertificate"
ADD CONSTRAINT "ProgramCertificate_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
