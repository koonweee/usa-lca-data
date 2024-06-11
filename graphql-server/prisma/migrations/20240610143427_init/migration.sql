/*
  Warnings:

  - The primary key for the `RawDisclosureData` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "RawDisclosureData" DROP CONSTRAINT "RawDisclosureData_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "RawDisclosureData_pkey" PRIMARY KEY ("id");
