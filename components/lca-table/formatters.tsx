import { LCAData } from "@/pages/api/get_lca_data";

const DATE_FORMAT_OPTIONS = {  year: "numeric", month: 'short', day: 'numeric' } as const;
const DATE_LOCALE = 'en-SG';

export function LCADataToTableDataSource(lcaData: LCAData[]): any[] {
  return lcaData.map((lca, index) => {
    const receivedDate = new Date(lca.applicationData.receivedDate);
    const decisionDate = new Date(lca.applicationData.decisionDate);
    return {
      key: index,
      lcaCaseNumber: lca.lcaCaseNumber,
      receivedDate: receivedDate.toLocaleDateString(DATE_LOCALE, DATE_FORMAT_OPTIONS),
      decisionDate: decisionDate.toLocaleDateString(DATE_LOCALE, DATE_FORMAT_OPTIONS),
      status: lca.applicationData.caseStatus,
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
