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
      baseSalary: lca.jobData.baseAnnualSalary.toString(),
      employerName: lca.employerData.name,
      employerCity: lca.employerData.city,
      employerState: lca.employerData.state,
    }
  })
}
