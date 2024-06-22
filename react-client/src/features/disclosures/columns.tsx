import { Button } from "@/components/ui/button";
import { LCADisclosure } from "@/lib/types";
import { getDisplayLCADisclosure } from "@/queries/formatters/lca-disclosure";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

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
    accessorFn: (row) => getDisplayLCADisclosure(row).startDate,
    header: ({ column }) => {
      return getSortableHeader(column, "Employment start date");
    },
    meta: {
      displayHeader: "Employment start date",
    },
  },
  {
    id: ColumnId.Salary,
    accessorFn: (row) => getDisplayLCADisclosure(row).salary,
    header: ({ column }) => {
      return getSortableHeader(column, "Base salary");
    },
    meta: {
      displayHeader: "Base salary",
    },
  },
];

function getSortableHeader(column: Column<LCADisclosure>, title: string) {
  const isSorted = column.getIsSorted() !== false;
  const isAsc = column.getIsSorted() === "asc";
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(isAsc)}>
      {title}
      {isSorted && isAsc && <ArrowUp className="ml-2 h-4 w-4" />}
      {isSorted && !isAsc && <ArrowDown className="ml-2 h-4 w-4" />}
      {!isSorted && <ArrowUpDown className="ml-2 h-4 w-4" />}
    </Button>
  );
}
