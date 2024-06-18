import { LCADisclosure } from "@/lib/types";
import { getDisplayLCADisclosure } from "@/queries/formatters/lca-disclosure";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<LCADisclosure>[] = [
  {
    id: "caseNumber",
    header: "Case number",
    accessorFn: (row) => getDisplayLCADisclosure(row).caseNumber,
  },
  {
    id: "visaClass",
    header: "Visa class",
    accessorFn: (row) => getDisplayLCADisclosure(row).visaClass,
  },
  {
    id: "caseStatus",
    header: "Case status",
    accessorFn: (row) => getDisplayLCADisclosure(row).caseStatus,
  },
  {
    id: "jobTitle",
    header: "Job title",
    accessorFn: (row) => getDisplayLCADisclosure(row).jobTitle,
  },
  {
    id: "employer.name",
    header: "Employer",
    accessorFn: (row) => getDisplayLCADisclosure(row).employer.name,
  },
  {
    id: "employer.city",
    header: "City",
    accessorFn: (row) => getDisplayLCADisclosure(row).employer.city,
  },
  {
    id: "employer.state",
    header: "State",
    accessorFn: (row) => getDisplayLCADisclosure(row).employer.state,
  },
  {
    id: "startDate",
    header: "Employment start date",
    accessorFn: (row) => getDisplayLCADisclosure(row).startDate,
  },
  {
    id: "salary",
    header: "Estimated (base) salary",
    accessorFn: (row) => getDisplayLCADisclosure(row).salary,
  },
];
