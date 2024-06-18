import {
  Casestatus,
  Employer,
  Visaclass,
  StringValuesAndCount,
} from "@/graphql/generated";
import { ColumnFiltersState } from "@tanstack/react-table";

export function getVisaFilters(
  columnFilters: ColumnFiltersState
): Visaclass[] | undefined {
  return getEnumFiltersFromStrArray(
    columnFilters,
    "visaClass"
    // VISA_CLASS_ENUM_TO_READABLE
  );
}

export function getCaseStatusFilters(
  columnFilters: ColumnFiltersState
): Casestatus[] | undefined {
  return getEnumFiltersFromStrArray(
    columnFilters,
    "caseStatus"
    // CASE_STATUS_ENUM_TO_READABLE
  );
}

export function getEnumFiltersFromStrArray<T extends string>(
  columnFilters: ColumnFiltersState,
  columnId: string
  // enumToStrRecord: Record<T, string>
): T[] | undefined {
  const columnFilter = columnFilters.find((f) => f.id === columnId);
  if (!columnFilter || !columnFilter.value) return undefined;
  return columnFilter.value as T[];
}

export function getEmployerUuidsFilters(
  columnFilters: ColumnFiltersState
): string[] | undefined {
  const columnFilter = columnFilters.find((f) => f.id === "employer.name");
  const asArray = columnFilter?.value ? (columnFilter.value as Employer[]) : [];
  return asArray.length > 0 ? asArray.map((e) => e.uuid) : undefined;
}

export function getJobTitleFilters(
  columnFilters: ColumnFiltersState
): string[] | undefined {
  const columnFilter = columnFilters.find((f) => f.id === "jobTitle");
  const asArray = columnFilter?.value
    ? (columnFilter.value as StringValuesAndCount[])
    : [];
  return asArray.length > 0 ? asArray.map((e) => e.value) : undefined;
}

export function getFacetedUniqueValuesMapFromArray<T extends { count: number }>(
  propertyKey: string,
  uniqueFacetsArray: T[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enumToStrRecord: Record<any, string>
): Map<string, number> {
  return new Map(
    uniqueFacetsArray.map((facet) => {
      // check that facet contains the property key
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (facet as any)[propertyKey];
      if (value === undefined) {
        throw new Error(`Facet does not contain property ${propertyKey}`);
      }
      return [enumToStrRecord[value], facet.count];
    })
  );
}
