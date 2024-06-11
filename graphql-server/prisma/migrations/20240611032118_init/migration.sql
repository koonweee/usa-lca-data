/*
  Warnings:

  - The primary key for the `Employer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `employerNaicsCode` on the `LCADisclosure` table. All the data in the column will be lost.
  - You are about to drop the `Worksite` table. If the table is not empty, all the data it contains will be lost.
  - The required column `uuid` was added to the `Employer` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `employerUuid` to the `LCADisclosure` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LCADisclosure" DROP CONSTRAINT "LCADisclosure_employerNaicsCode_fkey";

-- DropForeignKey
ALTER TABLE "LCADisclosure" DROP CONSTRAINT "LCADisclosure_worksitePostalCode_fkey";

-- AlterTable
ALTER TABLE "Employer" DROP CONSTRAINT "Employer_pkey",
ADD COLUMN     "uuid" TEXT NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ADD CONSTRAINT "Employer_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "LCADisclosure" DROP COLUMN "employerNaicsCode",
ADD COLUMN     "employerUuid" TEXT NOT NULL,
ADD COLUMN     "worksiteCity" TEXT,
ADD COLUMN     "worksiteState" TEXT,
ALTER COLUMN "jobTitle" DROP NOT NULL,
ALTER COLUMN "worksitePostalCode" DROP NOT NULL,
ALTER COLUMN "wageRateOfPayFrom" DROP NOT NULL,
ALTER COLUMN "wageRateOfPayTo" DROP NOT NULL,
ALTER COLUMN "wageRateOfPayUnit" DROP NOT NULL,
ALTER COLUMN "prevailingWageRateOfPay" DROP NOT NULL,
ALTER COLUMN "prevailingWageRateOfPayUnit" DROP NOT NULL;

-- DropTable
DROP TABLE "Worksite";

-- AddForeignKey
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_employerUuid_fkey" FOREIGN KEY ("employerUuid") REFERENCES "Employer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
