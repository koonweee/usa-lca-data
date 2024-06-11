-- CreateTable
CREATE TABLE "RawDisclosureData" (
    "caseNumber" TEXT NOT NULL,
    "caseStatus" TEXT,
    "visaClass" TEXT,
    "jobTitle" TEXT,
    "socCode" TEXT,
    "socTitle" TEXT,
    "fullTimePosition" BOOLEAN,
    "receivedDate" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "beginDate" TIMESTAMP(3),
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

    CONSTRAINT "RawDisclosureData_pkey" PRIMARY KEY ("caseNumber")
);
