-- CreateEnum
CREATE TYPE "payunit" AS ENUM ('Hour', 'Week', 'Bi-Weekly', 'Month', 'Year');

-- CreateEnum
CREATE TYPE "casestatus" AS ENUM ('Certified', 'Certified - Withdrawn', 'Denied', 'Withdrawn');

-- CreateEnum
CREATE TYPE "visaclass" AS ENUM ('E-3 Australian', 'H-1B', 'H-1B1 Chile', 'H-1B1 Singapore');

-- CreateTable (ResumeSubmission)
CREATE TABLE IF NOT EXISTS "ResumeSubmission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "s3key" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetJobs" TEXT NOT NULL DEFAULT 'Not Specified',

    CONSTRAINT "ResumeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ResumeSubmission_email_key" ON "ResumeSubmission"("email");

-- Drop FK constraints before type conversion
ALTER TABLE "LCADisclosure" DROP CONSTRAINT IF EXISTS "LCADisclosure_employerUuid_fkey";
ALTER TABLE "LCADisclosure" DROP CONSTRAINT IF EXISTS "LCADisclosure_socCode_fkey";

-- AlterTable: Employer uuid TEXT -> UUID
ALTER TABLE "Employer" ALTER COLUMN "uuid" SET DATA TYPE UUID USING "uuid"::UUID;

-- AlterTable: LCADisclosure
-- Convert employerUuid to UUID
ALTER TABLE "LCADisclosure" ALTER COLUMN "employerUuid" SET DATA TYPE UUID USING "employerUuid"::UUID;

-- Re-add FK constraints
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_employerUuid_fkey" FOREIGN KEY ("employerUuid") REFERENCES "Employer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_socCode_fkey" FOREIGN KEY ("socCode") REFERENCES "SOCJob"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Convert wage columns from DOUBLE PRECISION to BIGINT
ALTER TABLE "LCADisclosure" ALTER COLUMN "wageRateOfPayFrom" SET DATA TYPE BIGINT USING "wageRateOfPayFrom"::BIGINT;
ALTER TABLE "LCADisclosure" ALTER COLUMN "wageRateOfPayTo" SET DATA TYPE BIGINT USING "wageRateOfPayTo"::BIGINT;
ALTER TABLE "LCADisclosure" ALTER COLUMN "prevailingWageRateOfPay" SET DATA TYPE BIGINT USING "prevailingWageRateOfPay"::BIGINT;

-- Convert TEXT columns to enum types
ALTER TABLE "LCADisclosure" ALTER COLUMN "caseStatus" SET DATA TYPE "casestatus" USING "caseStatus"::"casestatus";
ALTER TABLE "LCADisclosure" ALTER COLUMN "visaClass" SET DATA TYPE "visaclass" USING "visaClass"::"visaclass";
ALTER TABLE "LCADisclosure" ALTER COLUMN "wageRateOfPayUnit" SET DATA TYPE "payunit" USING "wageRateOfPayUnit"::"payunit";
ALTER TABLE "LCADisclosure" ALTER COLUMN "prevailingWageRateOfPayUnit" SET DATA TYPE "payunit" USING "prevailingWageRateOfPayUnit"::"payunit";

-- AlterTable: RawDisclosureData - add computed/transformed columns
ALTER TABLE "RawDisclosureData"
    ADD COLUMN IF NOT EXISTS "receivedDate_date" DATE,
    ADD COLUMN IF NOT EXISTS "decisionDate_date" DATE,
    ADD COLUMN IF NOT EXISTS "beginDate_date" DATE,
    ADD COLUMN IF NOT EXISTS "socCode_clean" VARCHAR(10),
    ADD COLUMN IF NOT EXISTS "employerUuid" UUID,
    ADD COLUMN IF NOT EXISTS "fullTimePosition_bool" BOOLEAN,
    ADD COLUMN IF NOT EXISTS "wageRateOfPayFrom_numeric" DECIMAL,
    ADD COLUMN IF NOT EXISTS "wageRateOfPayTo_numeric" DECIMAL,
    ADD COLUMN IF NOT EXISTS "prevailingWageRateOfPay_numeric" DECIMAL,
    ADD COLUMN IF NOT EXISTS "wageRateOfPayUnit_enum" "payunit",
    ADD COLUMN IF NOT EXISTS "prevailingWageRateOfPayUnit_enum" "payunit",
    ADD COLUMN IF NOT EXISTS "visaClass_enum" "visaclass",
    ADD COLUMN IF NOT EXISTS "caseStatus_enum" "casestatus";

-- CreateIndex: Employer unique on (name, postalCode)
CREATE UNIQUE INDEX IF NOT EXISTS "Employer_name_postalCode_key" ON "Employer"("name", "postalCode");
