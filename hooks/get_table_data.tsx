import prisma from '@/lib/prisma'
import { Money } from 'money-types/money';
import { USD } from 'money-types/currency';
import { CaseStatus, LCADisclosure, WageUnitOfPay } from '@/data-preprocess/lca_types';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';

export interface LCATableDisplayData {
  lcaCaseNumber: string;
  applicationData: LCAApplicationDisplayData;
  jobData: LCAJobDisplayData;
  employerData: EmployerDisplayData;
}

export interface LCAJobDisplayData {
  jobTitle: string;
  socTitle: string;
  baseAnnualSalary: Money;
}

export interface LCAApplicationDisplayData {
  caseNumber: string;
  caseStatus: CaseStatus;
  receivedDate: Date;
  decisionDate: Date;
}

export interface EmployerDisplayData {
  name: string;
  city: string;
  state: string;
}

type PrismaLCAData =  Prisma.lca_disclosuresGetPayload<{}>

function calculateBaseAnnualSalary(wageRateOfPayFrom: Decimal, wageUnitOfPay: string): Money {
  // convert prisma decimal to number
  const wageRateOfPayFromNumber = wageRateOfPayFrom.toNumber();
  let yearlyWage: number;
  switch (wageUnitOfPay) {
    case WageUnitOfPay.YEAR:
      yearlyWage = wageRateOfPayFromNumber;
      break;
    case WageUnitOfPay.MONTH:
      yearlyWage = wageRateOfPayFromNumber * 12;
      break;
    case WageUnitOfPay.BI_WEEKLY:
      yearlyWage = wageRateOfPayFromNumber * 26;
      break;
    case WageUnitOfPay.WEEK:
      yearlyWage = wageRateOfPayFromNumber * 52;
      break;
    case WageUnitOfPay.HOUR:
      yearlyWage = wageRateOfPayFromNumber * 2080;
      break;
    default:
      throw new Error(`Unknown wage unit of pay: ${wageUnitOfPay}`);
  }
  return Money.fromNumber(yearlyWage, USD);
}

function lcaTableDisplayDataFormatter(lca_disclosure: PrismaLCAData): LCATableDisplayData {
  return {
    lcaCaseNumber: lca_disclosure.id,
    applicationData: {
      caseNumber: lca_disclosure.id,
      caseStatus: lca_disclosure.caseStatus as CaseStatus,
      receivedDate: lca_disclosure.receivedDate,
      decisionDate: lca_disclosure.decisionDate,
    },
    jobData:{
      jobTitle: lca_disclosure.jobTitle,
      socTitle: lca_disclosure.socTitle,
      baseAnnualSalary: calculateBaseAnnualSalary(lca_disclosure.wageRateOfPayFrom, lca_disclosure.wageUnitOfPay),
    },
    employerData: {
      name: lca_disclosure.employerName,
      city: lca_disclosure.worksiteCity,
      state: lca_disclosure.worksiteState,
    },
  }
}


export async function getTableData(): Promise<LCATableDisplayData[]> {
  const lca_disclosures = await prisma.lca_disclosures.findMany()
  // map to display format
  const lcaTableDisplayData = lca_disclosures.map(lcaTableDisplayDataFormatter);
  return lcaTableDisplayData;
}
