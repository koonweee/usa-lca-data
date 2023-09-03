import { LCAData } from "@/pages/api/get_lca_data";


export function LCADataToTableDataSource(lcaData: LCAData[]): any[] {
  return lcaData.map((lca, index) => {
    return {
      key: index,
      lcaCaseNumber: lca.lcaCaseNumber,
      receivedDate: lca.applicationData.receivedDate,
      decisionDate: lca.applicationData.decisionDate,
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
