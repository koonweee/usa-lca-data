
import { CaseStatus, WageUnitOfPay } from '@/data-preprocess/lca_types';
import { Prisma } from '@prisma/client';

import { Decimal } from '@prisma/client/runtime/library';

export interface LCAData {
  lcaCaseNumber: string;
  applicationData: ApplicationData;
  jobData: JobData;
  employerData: EmployerData;
  legalData?: LegalData;
}

export interface JobData {
  jobTitle: string;
  socTitle: string;
  baseAnnualSalary: number;
}

export interface ApplicationData {
  caseNumber: string;
  caseStatus: CaseStatus;
  receivedDate: Date;
  decisionDate: Date;
}

export interface EmployerData {
  name: string;
  city: string;
  state: string;
}

export interface LegalData {
  attorneyName: string;
  attorneyFirmName?: string;
}

type PrismaLCAData =  Prisma.lca_disclosuresGetPayload<{}>

function calculateBaseAnnualSalary(wageRateOfPayFrom: Decimal, wageUnitOfPay: string): number {
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
  return yearlyWage
}

function getCombinedName(firstName?: string, middleName?: string, lastName?: string): string {
  const nameParts = [firstName, middleName, lastName];
  return nameParts.filter((namePart) => namePart !== undefined).join(' ');
}

export function lcaDataFormatter(lca_disclosure: PrismaLCAData): LCAData {
  const agentRepresentingEmployer = lca_disclosure.agentRepresentingEmployer
  return {
    lcaCaseNumber: lca_disclosure.id,
    applicationData: {
      caseNumber: lca_disclosure.id,
      caseStatus: lca_disclosure.caseStatus as CaseStatus,
      receivedDate: new Date(lca_disclosure.receivedDate),
      decisionDate: new Date(lca_disclosure.decisionDate),
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
    legalData: agentRepresentingEmployer ? {
      attorneyName: getCombinedName(
        lca_disclosure.agentAttorneyFirstName ?? undefined,
        lca_disclosure.agentAttorneyMiddleName ?? undefined,
        lca_disclosure.agentAttorneyLastName ?? undefined),
      attorneyFirmName: lca_disclosure.lawfirmNameBusinessName ?? undefined,
    } : undefined
  }
}

