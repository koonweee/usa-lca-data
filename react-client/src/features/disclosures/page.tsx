import { ModeToggle } from "@/components/dark-mode-toggle";
import { DataTable } from "@/components/data-table/data-table";
import { SubmitResumeModal } from "@/components/submit-resume-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnId, columns } from "@/features/disclosures/columns";
import { DataTableToolbar } from "@/features/disclosures/data-table-toolbar";
import {
  getCaseStatusFilters,
  getColumnSortOrder,
  getEmployerUuidsFilters,
  getJobTitleFilters,
  getVisaFilters,
} from "@/features/disclosures/lib/filters";
import {
  InputMaybe,
  LcaDisclosureFilters,
  LcaDisclosureOrderByInput,
  PaginatedLcaDisclosuresDocument,
  PaginatedLcaDisclosuresQuery,
  PaginatedLcaDisclosuresQueryVariables,
  Visaclass,
} from "@/graphql/generated";
import { LCADisclosure } from "@/lib/types";
import { useQuery } from "@apollo/client";
import { ColumnFiltersState, SortingState, Table } from "@tanstack/react-table";
import React, { useEffect, useMemo } from "react";

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
    () => {
      // Initialize filters from URL params
      const initialFilters: ColumnFiltersState = [];

      const params = new URLSearchParams(window.location.search);

      // Get visa class from URL
      const visaClass = params.get("visa");
      if (visaClass) {
        initialFilters.push({
          id: "visaClass",
          value: visaClass.split(","),
        });
      }

      // Get case status from URL
      const caseStatus = params.get("status");
      if (caseStatus) {
        initialFilters.push({
          id: "caseStatus",
          value: caseStatus.split(","),
        });
      }

      return initialFilters;
    }
  );

  // Update URL when filters change
  useEffect(() => {
    const visaFilters = getVisaFilters(columnFilters);
    const statusFilters = getCaseStatusFilters(columnFilters);

    const params = new URLSearchParams(window.location.search);

    if (visaFilters?.length) {
      params.set("visa", visaFilters.join(","));
    } else {
      params.delete("visa");
    }

    if (statusFilters?.length) {
      params.set("status", statusFilters.join(","));
    } else {
      params.delete("status");
    }

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  }, [columnFilters]);

  const filters: InputMaybe<LcaDisclosureFilters> = useMemo(
    () => ({
      // visaClass: getVisaFilters(columnFilters),
      visaClass: [Visaclass.H_1B1Singapore],
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
  const { items, stats } = data?.lcaDisclosures || {};

  const [currentStats, setCurrentStats] = React.useState<
    PaginatedLcaDisclosuresQuery["lcaDisclosures"]["stats"] | undefined
  >(undefined);

  React.useEffect(() => {
    if (
      !!stats &&
      (currentStats?.successPercentage !== stats.successPercentage ||
        currentStats?.totalCount !== stats.totalCount)
    ) {
      setCurrentStats(stats);
    }
  }, [stats, currentStats]);

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
   * Clear loaded data if filters or sorting change
   */
  React.useEffect(() => {
    setLoadedData([]);
  }, [filters, sortingInput]);

  const toolbarComponent = React.useCallback(
    (props: { table: Table<LCADisclosure> }) => (
      <DataTableToolbar table={props.table} queryFilters={filters} />
    ),
    [filters]
  );

  return (
    <div className="h-full flex-1 flex-col space-y-5 md:p-8 flex">
      <div className="flex items-center space-y-2 px-5 pt-4 md:px-0 md:pt-0">
        <div className="w-full">
          <div className="flex justify-between border-b">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Explore jobs for Singaporeans 🇸🇬 working in the USA 🇺🇸
              </h2>
              <p className="text-muted-foreground py-1">
                {loading || currentStats === undefined ? (
                  <Skeleton className="h-4 w-[60px] inline-block" />
                ) : (
                  `${currentStats.totalCount}`
                )}
                <span>{" visa applications with a "}</span>
                {loading || currentStats === undefined ? (
                  <Skeleton className="h-4 w-[30px] inline-block" />
                ) : (
                  <span className="dark:text-green-600 text-green-400 font-semibold">{`${Math.round(
                    currentStats.successPercentage
                  )}%`}</span>
                )}
                <span>{" success rate"}</span>
              </p>
            </div>
            <div className="hidden md:flex">
              <ModeToggle />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:justify-between pt-4">
            <p className="hidden md:block">
              The H-1B1 visa is a special visa for Singaporean citizens to work
              in the USA.
              <br />
              Each year, a quota of 5,400 H-1B1 visas are available.
            </p>
            <div className="flex flex-wrap md:flex-col gap-2 items-center md:items-end">
              <a
                href="https://h1b1.notion.site"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  🔗 How does the H-1B1 visa work?
                </Button>
              </a>
              <SubmitResumeModal />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={loadedData}
        columns={columns}
        serverSidePaginationConfig={{
          rowCount: currentStats?.totalCount ?? 0,
          pagination,
          setPagination,
        }}
        toolbar={toolbarComponent}
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
