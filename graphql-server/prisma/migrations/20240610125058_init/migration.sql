-- CreateTable
CREATE TABLE "LCADisclosure" (
    "caseNumber" TEXT NOT NULL,
    "caseStatus" TEXT NOT NULL,
    "visaClass" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "socCode" TEXT NOT NULL,
    "fullTimePosition" BOOLEAN NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "decisionDate" TIMESTAMP(3) NOT NULL,
    "beginDate" TIMESTAMP(3) NOT NULL,
    "employerNaicsCode" TEXT NOT NULL,
    "worksitePostalCode" TEXT NOT NULL,
    "wageRateOfPayFrom" DOUBLE PRECISION NOT NULL,
    "wageRateOfPayTo" DOUBLE PRECISION NOT NULL,
    "wageRateOfPayUnit" TEXT NOT NULL,
    "prevailingWageRateOfPay" DOUBLE PRECISION NOT NULL,
    "prevailingWageRateOfPayUnit" TEXT NOT NULL,

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
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("naicsCode")
);

-- CreateTable
CREATE TABLE "Worksite" (
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,

    CONSTRAINT "Worksite_pkey" PRIMARY KEY ("postalCode")
);

-- AddForeignKey
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_socCode_fkey" FOREIGN KEY ("socCode") REFERENCES "SOCJob"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_employerNaicsCode_fkey" FOREIGN KEY ("employerNaicsCode") REFERENCES "Employer"("naicsCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LCADisclosure" ADD CONSTRAINT "LCADisclosure_worksitePostalCode_fkey" FOREIGN KEY ("worksitePostalCode") REFERENCES "Worksite"("postalCode") ON DELETE RESTRICT ON UPDATE CASCADE;
