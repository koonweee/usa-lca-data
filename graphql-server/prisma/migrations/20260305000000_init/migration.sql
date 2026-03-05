-- CreateEnum
CREATE TYPE "payunit" AS ENUM ('Hour', 'Week', 'Bi-Weekly', 'Month', 'Year');
CREATE TYPE "casestatus" AS ENUM ('Certified', 'Certified - Withdrawn', 'Denied', 'Withdrawn');
CREATE TYPE "visaclass" AS ENUM ('E-3 Australian', 'H-1B', 'H-1B1 Chile', 'H-1B1 Singapore');
CREATE TYPE "SeedRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');
CREATE TYPE "SeedMode" AS ENUM ('INCREMENTAL', 'FORCE');
CREATE TYPE "SeedQuarterStatus" AS ENUM ('DISCOVERED', 'SKIPPED_ALREADY_SEEDED', 'INGESTED', 'FAILED');

-- CreateTable
CREATE TABLE "ResumeSubmission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "s3key" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetJobs" TEXT NOT NULL DEFAULT 'Not Specified',

    CONSTRAINT "ResumeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LCADisclosure" (
    "caseNumber" TEXT NOT NULL,
    "jobTitle" TEXT,
    "socCode" TEXT NOT NULL,
    "fullTimePosition" BOOLEAN NOT NULL,
    "receivedDate" DATE NOT NULL,
    "decisionDate" DATE NOT NULL,
    "beginDate" DATE NOT NULL,
    "worksitePostalCode" TEXT,
    "wageRateOfPayFrom" BIGINT,
    "wageRateOfPayTo" BIGINT,
    "prevailingWageRateOfPay" BIGINT,
    "employerUuid" UUID NOT NULL,
    "worksiteCity" TEXT,
    "worksiteState" TEXT,
    "wageRateOfPayUnit" "payunit",
    "prevailingWageRateOfPayUnit" "payunit",
    "caseStatus" "casestatus" NOT NULL,
    "visaClass" "visaclass" NOT NULL,

    CONSTRAINT "LCADisclosure_pkey" PRIMARY KEY ("caseNumber")
);

-- CreateTable
CREATE TABLE "SOCJob" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "SOCJob_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Employer" (
    "naicsCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "RawDisclosureData" (
    "caseNumber" TEXT NOT NULL,
    "caseStatus" TEXT,
    "visaClass" TEXT,
    "jobTitle" TEXT,
    "socCode" TEXT,
    "socTitle" TEXT,
    "fullTimePosition" TEXT,
    "receivedDate" TEXT,
    "decisionDate" TEXT,
    "beginDate" TEXT,
    "employerNaicsCode" TEXT,
    "employerName" TEXT,
    "employerCity" TEXT,
    "employerState" TEXT,
    "employerPostalCode" TEXT,
    "worksitePostalCode" TEXT,
    "worksiteCity" TEXT,
    "worksiteState" TEXT,
    "wageRateOfPayFrom" TEXT,
    "wageRateOfPayTo" TEXT,
    "wageRateOfPayUnit" TEXT,
    "prevailingWageRateOfPay" TEXT,
    "prevailingWageRateOfPayUnit" TEXT,
    "receivedDate_date" DATE,
    "decisionDate_date" DATE,
    "beginDate_date" DATE,
    "socCode_clean" VARCHAR(10),
    "employerUuid" UUID,
    "fullTimePosition_bool" BOOLEAN,
    "wageRateOfPayFrom_numeric" DECIMAL,
    "wageRateOfPayTo_numeric" DECIMAL,
    "prevailingWageRateOfPay_numeric" DECIMAL,
    "wageRateOfPayUnit_enum" "payunit",
    "prevailingWageRateOfPayUnit_enum" "payunit",
    "visaClass_enum" "visaclass",
    "caseStatus_enum" "casestatus",

    CONSTRAINT "RawDisclosureData_pkey" PRIMARY KEY ("caseNumber")
);

-- CreateTable
CREATE TABLE "SeedRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP,
    "status" "SeedRunStatus" NOT NULL,
    "mode" "SeedMode" NOT NULL,
    "fyStart" INTEGER,
    "fyEnd" INTEGER,
    "discoveredCount" INTEGER NOT NULL DEFAULT 0,
    "ingestedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" TEXT,

    CONSTRAINT "SeedRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedRunQuarter" (
    "id" TEXT NOT NULL,
    "seedRunId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" "SeedQuarterStatus" NOT NULL,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "ingestedCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "ingestedAt" TIMESTAMP,

    CONSTRAINT "SeedRunQuarter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeededQuarter" (
    "fiscalYear" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "lastSeededAt" TIMESTAMP NOT NULL,
    "lastRunId" TEXT NOT NULL,
    "status" "SeedQuarterStatus" NOT NULL,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "ingestedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SeededQuarter_pkey" PRIMARY KEY ("fiscalYear","quarter")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSubmission_email_key" ON "ResumeSubmission"("email");
CREATE UNIQUE INDEX "Employer_name_postalCode_key" ON "Employer"("name", "postalCode");
CREATE UNIQUE INDEX "SeedRunQuarter_seedRunId_fiscalYear_quarter_key" ON "SeedRunQuarter"("seedRunId", "fiscalYear", "quarter");
CREATE INDEX "SeedRun_startedAt_idx" ON "SeedRun"("startedAt");
CREATE INDEX "SeedRunQuarter_fiscalYear_quarter_status_idx" ON "SeedRunQuarter"("fiscalYear", "quarter", "status");
CREATE INDEX "SeededQuarter_lastSeededAt_idx" ON "SeededQuarter"("lastSeededAt");

-- AddForeignKey
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_employerUuid_fkey" FOREIGN KEY ("employerUuid") REFERENCES "Employer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_socCode_fkey" FOREIGN KEY ("socCode") REFERENCES "SOCJob"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SeedRunQuarter" ADD CONSTRAINT "SeedRunQuarter_seedRunId_fkey" FOREIGN KEY ("seedRunId") REFERENCES "SeedRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
