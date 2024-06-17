import { Casestatus, Visaclass } from "@/graphql/generated";
import {
  CASE_STATUS_ENUM_TO_READABLE,
  VISA_CLASS_ENUM_TO_READABLE,
} from "@/queries/formatters/lca-disclosure";
import { ColumnFiltersState } from "@tanstack/react-table";

export function getVisaFilters(
  columnFilters: ColumnFiltersState
): Visaclass[] | undefined {
  return getEnumFiltersFromStrArray(
    columnFilters,
    "visaClass",
    VISA_CLASS_ENUM_TO_READABLE
  );
}

export function getCaseStatusFilters(
  columnFilters: ColumnFiltersState
): Casestatus[] | undefined {
  return getEnumFiltersFromStrArray(
    columnFilters,
    "caseStatus",
    CASE_STATUS_ENUM_TO_READABLE
  );
}

export function getEnumFiltersFromStrArray<T extends string>(
  columnFilters: ColumnFiltersState,
  columnId: string,
  enumToStrRecord: Record<T, string>
): T[] | undefined {
  const columnFilter = columnFilters.find((f) => f.id === columnId);
  if (!columnFilter || !columnFilter.value) return undefined;
  const filterEnums = (columnFilter.value as string[])
    .map((value) => {
      const result = Object.entries(enumToStrRecord).find(
        ([, readable]) => readable === value
      );
      return result ? (result[0] as T) : undefined;
    })
    .filter((value): value is T => !!value);
  if (!filterEnums.length) return undefined;
  return filterEnums;
}

export function getEmployerUuidsFilters(
  columnFilters: ColumnFiltersState
): string[] | undefined {
  const columnFilter = columnFilters.find((f) => f.id === "employer.name");
  const asArray = columnFilter?.value ? (columnFilter.value as string[]) : [];
  return asArray.length > 0 ? asArray : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFacetedUniqueValuesMapFromArray<T extends { count: number }>(
  propertyKey: string,
  uniqueFacetsArray: T[],
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
