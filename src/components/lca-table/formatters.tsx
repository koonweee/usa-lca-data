import { LCAData } from "@/types/lca";

const DATE_FORMAT_OPTIONS = {  year: "numeric", month: 'short', day: 'numeric' } as const;
const DATE_LOCALE = 'en-SG';

export interface LcaTableData {
  key: number;
  lcaCaseNumber: string;
  receivedDate: string;
  decisionDate: string;
  caseStatus: string;
  jobTitle: string;
  baseSalary: string;
  employerName: string;
  employerCity: string;
  employerState: string;
}

export function LCADataToTableDataSource(lcaData: LCAData[]): LcaTableData[] {
  return lcaData.map((lca, index) => {
    const receivedDate = new Date(lca.applicationData.receivedDate);
    const decisionDate = new Date(lca.applicationData.decisionDate);
    return {
      key: index,
      lcaCaseNumber: lca.lcaCaseNumber,
      receivedDate: receivedDate.toLocaleDateString(DATE_LOCALE, DATE_FORMAT_OPTIONS),
      decisionDate: decisionDate.toLocaleDateString(DATE_LOCALE, DATE_FORMAT_OPTIONS),
      caseStatus: lca.applicationData.caseStatus,
      jobTitle: lca.jobData.jobTitle,
      baseSalary: formatAsUSD(lca.jobData.baseAnnualSalary),
      employerName: lca.employerData.name,
      employerCity: lca.employerData.city,
      employerState: lca.employerData.state,
    }
  })
}

function formatAsUSD(amount: number): string {
  // number as string
  const amountString = amount.toString();
  // add $ and USD
  const formattedAmount = `$${amountString} USD`;
  return formattedAmount;
}


export function extractNumberFromUSDString(amount: string): number {
  // remove $ and USD
  const amountString = amount.replace('$', '').replace(' USD', '');
  // convert to number
  const amountNumber = Number(amountString);
  return amountNumber;
}

export function formatDateStringAsDate(dateString: string): Date {
  const date = new Date(dateString);
  return date;
}
