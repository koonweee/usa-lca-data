-- CreateEnum
CREATE TYPE "SeedRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "SeedMode" AS ENUM ('INCREMENTAL', 'FORCE');

-- CreateEnum
CREATE TYPE "SeedQuarterStatus" AS ENUM ('DISCOVERED', 'SKIPPED_ALREADY_SEEDED', 'INGESTED', 'FAILED');

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
CREATE INDEX "SeedRun_startedAt_idx" ON "SeedRun"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SeedRunQuarter_seedRunId_fiscalYear_quarter_key" ON "SeedRunQuarter"("seedRunId", "fiscalYear", "quarter");

-- CreateIndex
CREATE INDEX "SeedRunQuarter_fiscalYear_quarter_status_idx" ON "SeedRunQuarter"("fiscalYear", "quarter", "status");

-- CreateIndex
CREATE INDEX "SeededQuarter_lastSeededAt_idx" ON "SeededQuarter"("lastSeededAt");

-- AddForeignKey
ALTER TABLE "SeedRunQuarter" ADD CONSTRAINT "SeedRunQuarter_seedRunId_fkey" FOREIGN KEY ("seedRunId") REFERENCES "SeedRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
