import { ModeToggle } from "@/components/dark-mode-toggle";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/features/disclosures/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnId, columns } from "@/features/disclosures/columns";
import {
  getColumnSortOrder,
  getCaseStatusFilters,
  getEmployerUuidsFilters,
  getJobTitleFilters,
  getVisaFilters,
} from "@/features/disclosures/lib/filters";
import {
  InputMaybe,
  LcaDisclosureFilters,
  LcaDisclosureOrderByInput,
  PaginatedLcaDisclosuresDocument,
  PaginatedLcaDisclosuresQueryVariables,
} from "@/graphql/generated";
import { useQuery } from "@apollo/client";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { LCADisclosure } from "@/lib/types";

export default function LCADisclosuresPage() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: ColumnId.StartDate, desc: true },
  ]);

  const sortingInput: InputMaybe<LcaDisclosureOrderByInput> = useMemo(
    () => ({
      beginDate: getColumnSortOrder(sorting, ColumnId.StartDate),
      wageRateOfPayFrom: getColumnSortOrder(sorting, ColumnId.Salary),
    }),
    [sorting]
  );

  /**
   * Each column filter is of shape { id: <columnId>, value: <filterValue>[]}
   */
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const filters: InputMaybe<LcaDisclosureFilters> = useMemo(
    () => ({
      visaClass: getVisaFilters(columnFilters),
      caseStatus: getCaseStatusFilters(columnFilters),
      employerUuid: getEmployerUuidsFilters(columnFilters),
      jobTitle: getJobTitleFilters(columnFilters),
    }),
    [columnFilters]
  );

  const queryTake = pagination.pageSize * 3;

  const queryVariables: PaginatedLcaDisclosuresQueryVariables = {
    pagination: {
      take: queryTake,
      skip: pagination.pageIndex * queryTake,
    },
    filters,
    sorting: sortingInput,
  };

  const { loading, data } = useQuery(PaginatedLcaDisclosuresDocument, {
    variables: queryVariables,
  });

  const { items, totalCount: dataCount } = data?.lcaDisclosures || {};

  const [totalCount, setTotalCount] = React.useState<number | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (!!dataCount && totalCount !== dataCount) {
      setTotalCount(dataCount);
    }
  }, [dataCount, totalCount]);

  const [loadedData, setLoadedData] = React.useState<LCADisclosure[]>([]);
  const loadedDataIDsSet = React.useMemo(() => {
    return new Set(loadedData.map((d) => d.caseNumber));
  }, [loadedData]);

  React.useEffect(() => {
    if (items) {
      const newItems = items.filter((i) => !loadedDataIDsSet.has(i.caseNumber));
      if (newItems.length > 0) {
        setLoadedData([...loadedData, ...newItems]);
      }
    }
  }, [items, loadedData, loadedDataIDsSet]);

  /**
   * Clear loaded data if filters change
   */
  React.useEffect(() => {
    setLoadedData([]);
  }, [filters]);

  return (
    <div className="h-full flex-1 flex-col space-y-8 md:p-8 flex">
      <div className="flex items-center justify-between space-y-2 px-8 pt-4 md:px-0 md:pt-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Explore USA visa data
          </h2>
          <p className="text-muted-foreground">
            {totalCount === undefined ? (
              <Skeleton className="h-4 w-[60px] inline-block" />
            ) : (
              `${totalCount}`
            )}
            <span>{" visa applications from the U.S Department of Labor"}</span>
          </p>
        </div>
        <div className="hidden md:flex">
          <ModeToggle />
        </div>
      </div>

      <DataTable
        data={loadedData}
        columns={columns}
        serverSidePaginationConfig={{
          rowCount: totalCount ?? 0,
          pagination,
          setPagination,
        }}
        toolbar={(props) => (
          <DataTableToolbar table={props.table} queryFilters={filters} />
        )}
        serverSideFilteringConfig={{
          columnFilters,
          setColumnFilters,
          sorting,
          setSorting,
        }}
        isLoading={loading}
        defaultHiddenColumnIds={[ColumnId.CaseNumber]}
      />
    </div>
  );
}
