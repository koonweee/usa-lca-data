import { LCADisclosure } from "@/lib/types";
import { getDisplayLCADisclosure } from "@/queries/formatters/lca-disclosure";

import { ColumnDef } from "@tanstack/react-table";

export enum ColumnId {
  CaseNumber = "caseNumber",
  VisaClass = "visaClass",
  CaseStatus = "caseStatus",
  JobTitle = "jobTitle",
  EmployerName = "employer.name",
  EmployerCity = "employer.city",
  EmployerState = "employer.state",
  StartDate = "startDate",
  Salary = "salary",
}

export const columns: ColumnDef<LCADisclosure>[] = [
  {
    id: ColumnId.CaseNumber,
    header: "Case number",
    accessorFn: (row) => getDisplayLCADisclosure(row).caseNumber,
  },
  {
    id: ColumnId.VisaClass,
    header: "Visa class",
    accessorFn: (row) => getDisplayLCADisclosure(row).visaClass,
  },
  {
    id: ColumnId.CaseStatus,
    header: "Case status",
    accessorFn: (row) => getDisplayLCADisclosure(row).caseStatus,
  },
  {
    id: ColumnId.JobTitle,
    header: "Job title",
    accessorFn: (row) => getDisplayLCADisclosure(row).jobTitle,
  },
  {
    id: ColumnId.EmployerName,
    header: "Employer",
    accessorFn: (row) => getDisplayLCADisclosure(row).employer.name,
  },
  {
    id: ColumnId.EmployerCity,
    header: "City",
    accessorFn: (row) => getDisplayLCADisclosure(row).employer.city,
  },
  {
    id: ColumnId.EmployerState,
    header: "State",
    accessorFn: (row) => getDisplayLCADisclosure(row).employer.state,
  },
  {
    id: ColumnId.StartDate,
    header: "Employment start date",
    accessorFn: (row) => getDisplayLCADisclosure(row).startDate,
  },
  {
    id: ColumnId.Salary,
    header: "Estimated (base) salary",
    accessorFn: (row) => getDisplayLCADisclosure(row).salary,
  },
];
