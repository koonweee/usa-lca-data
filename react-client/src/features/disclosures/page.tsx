import { MobileFilters } from "@/features/disclosures/mobile-filters";
import { useCompactLayout } from "@/hooks/use-compact-layout";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { DataTable } from "@/components/data-table/data-table";
// import { SubmitResumeModal } from "@/components/submit-resume-modal";
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
  PaginatedLcaDisclosuresQueryVariables,
  Visaclass,
} from "@/graphql/generated";
import { LCADisclosure } from "@/lib/types";
import { gql, useQuery } from "@apollo/client";
import { ColumnFiltersState, SortingState, Table } from "@tanstack/react-table";
import React, { useEffect, useMemo } from "react";

const CohortStats = gql`
  query CertificationCohort($filters: LCADisclosureFilters) {
    lcaDisclosures {
      stats(filters: $filters) {
        totalCount
        successPercentage
      }
    }
  }
`;
export default function LCADisclosuresPage() {
  const mobile = useCompactLayout();
  const [paginationMobile, setPaginationMobile] = React.useState(mobile);
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
    [sorting],
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
    },
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
      `${window.location.pathname}?${params}`,
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
    [columnFilters],
  );

  const queryTake = mobile ? 30 : pagination.pageSize;
  const pageIndex = paginationMobile === mobile ? pagination.pageIndex : 0;
  const scope = JSON.stringify([filters, sortingInput, mobile, queryTake]);
  const queryVariables: PaginatedLcaDisclosuresQueryVariables = {
    pagination: { take: queryTake, skip: pageIndex * queryTake },
    filters,
    sorting: sortingInput,
  };
  const { loading, data, error, refetch } = useQuery(
    PaginatedLcaDisclosuresDocument,
    {
      variables: queryVariables,
      notifyOnNetworkStatusChange: true,
    },
  );
  // Separate cohort query also works with older servers whose status-filtered rate is incorrect.
  const { data: cohortData, loading: cohortLoading } = useQuery<{
    lcaDisclosures: {
      stats: { totalCount: number; successPercentage: number };
    };
  }>(CohortStats, {
    variables: { filters: { ...filters, caseStatus: undefined } },
  });
  const rate = cohortData?.lcaDisclosures.stats;
  const [chunks, setChunks] = React.useState<{
    scope: string;
    pages: Record<number, LCADisclosure[]>;
    stats?: { totalCount: number; successPercentage: number };
  }>({ scope: "", pages: {} });
  useEffect(() => {
    if (loading || !data) return;
    setChunks((previous) => ({
      scope,
      stats: data.lcaDisclosures.stats,
      pages: {
        ...(previous.scope === scope ? previous.pages : {}),
        [pageIndex]: data.lcaDisclosures.items,
      },
    }));
  }, [data, loading, scope, pageIndex]);
  const currentStats =
    data?.lcaDisclosures.stats ??
    (chunks.scope === scope ? chunks.stats : undefined);
  const visiblePages = chunks.scope === scope ? { ...chunks.pages } : {};
  if (!loading && data) visiblePages[pageIndex] = data.lcaDisclosures.items;
  const loadedData = mobile
    ? Array.from(
        new Map(
          Object.values(visiblePages)
            .flat()
            .map((item) => [item.caseNumber, item]),
        ).values(),
      )
    : (data?.lcaDisclosures.items ??
      (error && chunks.scope === scope ? chunks.pages[pageIndex] : undefined) ??
      []);
  const resetResults = () => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    document.getElementById("scroll-area-viewport")?.scrollTo(0, 0);
  };
  useEffect(() => {
    setPaginationMobile(mobile);
    resetResults();
  }, [mobile]);
  const updateFilters: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  > = (next) => {
    setColumnFilters(next);
    resetResults();
  };
  const updateSorting: React.Dispatch<React.SetStateAction<SortingState>> = (
    next,
  ) => {
    setSorting(next);
    resetResults();
  };

  const toolbarComponent = React.useCallback(
    (props: { table: Table<LCADisclosure> }) =>
      mobile ? null : (
        <DataTableToolbar table={props.table} queryFilters={filters} />
      ),
    [filters, mobile],
  );

  return (
    <div className="disclosures-page flex min-h-0 flex-1 flex-col gap-3 xl:gap-5 xl:p-8">
      <div className="disclosures-header flex shrink-0 items-center gap-2 px-5 pt-3 xl:px-0 xl:pt-0">
        <div className="w-full">
          <div className="flex justify-between border-b">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Explore jobs for Singaporeans 🇸🇬 working in the USA 🇺🇸
              </h2>
              <div
                className="text-muted-foreground flex flex-wrap items-center gap-x-3 py-1 min-h-8"
                aria-live="polite"
              >
                {currentStats ? (
                  <span>
                    {currentStats.totalCount.toLocaleString()} applications
                  </span>
                ) : error ? (
                  "Application data unavailable"
                ) : (
                  <Skeleton>
                    <span className="invisible">
                      8,888 applications
                    </span>
                  </Skeleton>
                )}
                {cohortLoading && !rate && (
                  <Skeleton className="whitespace-nowrap">
                    <span className="invisible">· 94% certified</span>
                  </Skeleton>
                )}
                {rate &&
                  rate.totalCount > 0 &&
                  Number.isFinite(rate.successPercentage) &&
                  rate.successPercentage >= 0 &&
                  rate.successPercentage <= 100 && (
                    <span
                      className="whitespace-nowrap"
                      title="Certification rate across all statuses, using the other selected filters"
                    >
                      <span aria-hidden="true">· </span>
                      <span className="success-text font-semibold">
                        {Math.round(rate.successPercentage)}%
                      </span>{" "}
                      certified
                    </span>
                  )}
              </div>
            </div>
            <div className="hidden xl:flex">
              <ModeToggle />
            </div>
          </div>
          <div className="disclosures-help flex flex-col xl:flex-row gap-2 xl:gap-4 xl:justify-between pt-2 xl:pt-4">
            <p className="hidden min-w-0 flex-1 xl:block">
              The H-1B1 visa is a special visa for Singaporean citizens to work
              in the USA.
              <br />
              Each year, a quota of 5,400 H-1B1 visas are available.
            </p>
            <div className="flex min-w-0 items-center gap-2 xl:shrink-0 xl:flex-col xl:items-end">
              <Button
                asChild
                variant="outline"
                className="h-11 min-w-0 flex-1 gap-2 whitespace-normal px-3 text-left leading-tight xl:h-10 xl:flex-none xl:whitespace-nowrap"
              >
                <a
                  href="https://h1b1.notion.site"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span aria-hidden="true">🔗</span>
                  <span>How does the H-1B1 visa work?</span>
                </a>
              </Button>
              {mobile && (
                <MobileFilters
                  filters={columnFilters}
                  sorting={sorting}
                  onApply={(nextFilters, nextSorting) => {
                    setColumnFilters(nextFilters);
                    setSorting(nextSorting);
                    resetResults();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={loadedData}
        columns={columns}
        serverSidePaginationConfig={{
          rowCount: currentStats?.totalCount ?? 0,
          pagination: { ...pagination, pageIndex, pageSize: queryTake },
          setPagination,
        }}
        toolbar={toolbarComponent}
        serverSideFilteringConfig={{
          columnFilters,
          setColumnFilters: updateFilters,
          sorting,
          setSorting: updateSorting,
        }}
        isLoading={loading}
        error={!!error}
        onRetry={() => {
          void refetch();
        }}
        onClear={columnFilters.length ? () => updateFilters([]) : undefined}
        defaultHiddenColumnIds={[ColumnId.CaseNumber]}
      />
    </div>
  );
}
