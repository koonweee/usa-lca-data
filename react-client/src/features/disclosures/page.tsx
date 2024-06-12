import { ModeToggle } from "@/components/dark-mode-toggle";
import { DataTable } from "@/components/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/features/disclosures/columns";
import {
  getCaseStatusFilters,
  getEmployerNameFilters,
  getFacetedUniqueValuesMapFromArray,
  getVisaFilters,
} from "@/features/disclosures/lib/filters";
import {
  PaginatedLcaDisclosuresDocument,
  SortOrder,
  AllEmployersDocument,
  PaginatedLcaDisclosuresQueryVariables,
} from "@/graphql/generated";
import { CASE_STATUS_ENUM_TO_READABLE, VISA_CLASS_ENUM_TO_READABLE } from "@/queries/formatters/lca-disclosure";
import { useQuery } from "@apollo/client";
import { ColumnFiltersState } from "@tanstack/react-table";
import React, { useMemo } from "react";

export default function LCADisclosuresPage() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  /**
   * Each column filter is of shape { id: <columnId>, value: <filterValue>[]}
   */
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const queryVariables: PaginatedLcaDisclosuresQueryVariables = {
      take: pagination.pageSize,
      skip: pagination.pageIndex * pagination.pageSize,
      orderBy: [
        {
          beginDate: SortOrder.Desc,
        },
      ],
      visaClasses: getVisaFilters(columnFilters),
      caseStatuses: getCaseStatusFilters(columnFilters),
      employerNames: getEmployerNameFilters(columnFilters),
  };

  const { loading, data } = useQuery(
    PaginatedLcaDisclosuresDocument,
    {
      variables: queryVariables,
    }
  );

  const { items, count, uniqueCaseStatusFacets, uniqueVisaClassFacets } =
    data?.lcaDisclosures || {};

  const { data: allEmployersData } = useQuery(AllEmployersDocument);

  const uniqueCaseStatusFacetsMap = useMemo(
    () =>
      uniqueCaseStatusFacets
        ? getFacetedUniqueValuesMapFromArray(
            "caseStatus",
            uniqueCaseStatusFacets,
            CASE_STATUS_ENUM_TO_READABLE,
          )
        : new Map<string, number>(),
    [uniqueCaseStatusFacets]
  );

  const uniqueCaseStatusFacetsMapRef = React.useRef<Map<string, number>>();
  uniqueCaseStatusFacetsMapRef.current = uniqueCaseStatusFacetsMap;



  const uniqueVisaClassFacetsMap = useMemo(
    () =>
      uniqueVisaClassFacets
        ? getFacetedUniqueValuesMapFromArray(
            "visaClass",
            uniqueVisaClassFacets,
            VISA_CLASS_ENUM_TO_READABLE,
          )
        : new Map<string, number>(),
    [uniqueVisaClassFacets]
  );

  const uniqueVisaClassFacetsMapRef = React.useRef<Map<string, number>>();
  uniqueVisaClassFacetsMapRef.current = uniqueVisaClassFacetsMap;

  const getFacetedUniqueValues= ()=> (_: unknown, columnId: string) => () => {
    if (columnId === "caseStatus") {
      return uniqueCaseStatusFacetsMapRef.current ?? new Map<string, number>();
    }
    if (columnId === "visaClass") {
      return uniqueVisaClassFacetsMapRef.current ?? new Map<string, number>();
    }
    return new Map<string, number>();
  }

  const employerOptions = allEmployersData?.employers.map((employer) => ({
    value: employer.name,
    label: employer.name,
  }));

  console.log('employerOptions', employerOptions?.length)

  const caseStatusOptions = useMemo(() => Object.values(CASE_STATUS_ENUM_TO_READABLE).map(
    (value) => ({ value, label: value })
  ), []);

  const visaClassOptions = useMemo(() => Object.values(VISA_CLASS_ENUM_TO_READABLE).map(
    (value) => ({ value, label: value })
  ), []);

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Explore USA visa data
          </h2>
          <p className="text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-[60px] inline-block" />
            ) : (
              `${count}`
            )}
            <span>{" visa applications from the U.S Department of Labor"}</span>
          </p>
        </div>
        <ModeToggle />
      </div>

      <DataTable
        data={items ?? []}
        columns={columns}
        serverSidePaginationConfig={{
          rowCount: count ?? 0,
          pagination,
          setPagination,
        }}
        serverSideFilteringConfig={{
          columnFilters,
          setColumnFilters,
          getFacetedUniqueValues,
          filterOptionsMap: new Map([
            ["caseStatus", caseStatusOptions],
            ["visaClass", visaClassOptions],
            ["employer.name", employerOptions?.slice(0,50) ?? []],
          ]),
        }}
        isLoading={loading}
      />
    </div>
  );
}