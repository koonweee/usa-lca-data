import { ModeToggle } from "@/components/dark-mode-toggle";
import { DataTable } from "@/components/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "@/features/disclosures/columns";
import {
  getCaseStatusFilters,
  getEmployerUuidsFilters,
  getVisaFilters,
} from "@/features/disclosures/lib/filters";
import {
  InputMaybe,
  LcaDisclosureFilters,
  PaginatedLcaDisclosuresDocument,
  PaginatedLcaDisclosuresQueryVariables,
  UniqueCaseStatusesDocument,
  UniqueVisaClassesDocument,
} from "@/graphql/generated";
import {
  CASE_STATUS_ENUM_TO_READABLE,
  VISA_CLASS_ENUM_TO_READABLE,
} from "@/queries/formatters/lca-disclosure";
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

  console.count("LCADisclosuresPage");

  const filters: InputMaybe<LcaDisclosureFilters> = useMemo(
    () => ({
      visaClass: getVisaFilters(columnFilters),
      caseStatus: getCaseStatusFilters(columnFilters),
      employerUuid: getEmployerUuidsFilters(columnFilters),
    }),
    [columnFilters]
  );

  const queryVariables: PaginatedLcaDisclosuresQueryVariables = {
    pagination: {
      take: pagination.pageSize,
      skip: pagination.pageIndex * pagination.pageSize,
    },
    filters,
  };

  const { loading, data } = useQuery(PaginatedLcaDisclosuresDocument, {
    variables: queryVariables,
  });

  const { items, totalCount } = data?.lcaDisclosures || {};

  const { loading: isCaseStatusLoading, data: caseStatusData } = useQuery(
    UniqueCaseStatusesDocument,
    {
      variables: {
        filters,
      },
    }
  );

  const caseStatusOptions = useMemo(() => {
    return (
      caseStatusData?.uniqueColumnValues?.caseStatuses?.uniqueValues.map(
        (value) => ({
          value: CASE_STATUS_ENUM_TO_READABLE[value],
          label: CASE_STATUS_ENUM_TO_READABLE[value],
        })
      ) ?? ([] as { value: string; label: string }[])
    );
  }, [caseStatusData]);

  const { loading: isVisaClassLoading, data: visaClassData } = useQuery(
    UniqueVisaClassesDocument,
    {
      variables: {
        filters,
      },
    }
  );

  const visaClassOptions = useMemo(() => {
    return (
      visaClassData?.uniqueColumnValues?.visaClasses?.uniqueValues.map(
        (value) => ({
          value: VISA_CLASS_ENUM_TO_READABLE[value],
          label: VISA_CLASS_ENUM_TO_READABLE[value],
        })
      ) ?? ([] as { value: string; label: string }[])
    );
  }, [visaClassData]);

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
              `${totalCount}`
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
          rowCount: totalCount ?? 0,
          pagination,
          setPagination,
        }}
        serverSideFilteringConfig={{
          columnFilters,
          setColumnFilters,
          filterOptionsMap: new Map([
            [
              "visaClass",
              { options: visaClassOptions, isLoading: isVisaClassLoading },
            ],
            [
              "caseStatus",
              { options: caseStatusOptions, isLoading: isCaseStatusLoading },
            ],
          ]),
        }}
        isLoading={loading}
      />
    </div>
  );
}
