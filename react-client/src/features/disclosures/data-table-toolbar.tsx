import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useQuery } from "@apollo/client";
import {
  Employer,
  InputMaybe,
  LcaDisclosureFilters,
  PaginatedUniqueEmployersDocument,
  PaginatedUniqueEmployersQueryVariables,
  UniqueCaseStatusesDocument,
  UniqueVisaClassesDocument,
} from "@/graphql/generated";
import { FilterUsingBackend } from "@/components/filter-using-backend";
import React, { useMemo } from "react";
import { useDebounce } from "use-debounce";
import {
  CASE_STATUS_ENUM_TO_READABLE,
  VISA_CLASS_ENUM_TO_READABLE,
} from "@/queries/formatters/lca-disclosure";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  queryFilters: InputMaybe<LcaDisclosureFilters>;
}

export function DataTableToolbar<TData>({
  table,
  queryFilters,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  /** Case status and visa type filters */
  const { loading: isCaseStatusLoading, data: caseStatusData } = useQuery(
    UniqueCaseStatusesDocument,
    {
      variables: {
        filters: queryFilters,
      },
    }
  );

  const caseStatusOptions = useMemo(() => {
    return (
      caseStatusData?.uniqueColumnValues?.caseStatuses?.uniqueValues.map(
        (value) => ({
          value: value.caseStatus,
          label: CASE_STATUS_ENUM_TO_READABLE[value.caseStatus],
          count: value.count,
        })
      ) ?? []
    );
  }, [caseStatusData]);

  const { loading: isVisaClassLoading, data: visaClassData } = useQuery(
    UniqueVisaClassesDocument,
    {
      variables: {
        filters: queryFilters,
      },
    }
  );

  const visaClassOptions = useMemo(() => {
    return (
      visaClassData?.uniqueColumnValues?.visaClasses?.uniqueValues.map(
        (value) => ({
          value: value.visaClass,
          label: VISA_CLASS_ENUM_TO_READABLE[value.visaClass],
          count: value.count,
        })
      ) ?? []
    );
  }, [visaClassData]);

  /** For employer filters */
  const pageSize = 20;

  const idAccessorFn = (entry: Employer) => entry.uuid;
  const displayAccessorFn = (entry: Employer) => entry.name;
  const countAccessorFn = (entry: Employer) => entry.count;

  const [searchPagination, setSearchPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const [searchStr, setSearchStr] = React.useState("");
  const [debouncedSearchStr] = useDebounce(searchStr, 300);

  const searchQueryVariables: PaginatedUniqueEmployersQueryVariables = {
    pagination: {
      take: searchPagination.pageSize,
      skip: searchPagination.pageIndex * pageSize,
    },
    filters: queryFilters,
    employerNameSearchStr:
      debouncedSearchStr.length > 0 ? debouncedSearchStr : undefined,
    // searchStr: debouncedSearchStr.length > 0 ? debouncedSearchStr : undefined,
  };

  const { loading: isEmployersQueryLoading, data: employersQueryData } =
    useQuery(PaginatedUniqueEmployersDocument, {
      variables: searchQueryVariables,
    });

  console.log("employersQueryData", employersQueryData);

  const { uniqueColumnValues } = employersQueryData || {};
  const { employers } = uniqueColumnValues || {};
  const {
    hasNext: employersHasNext = false,
    uniqueValues: employersQueryItems = [],
  } = employers || {};

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {table.getColumn("caseStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("caseStatus")}
            title="Case status"
            options={caseStatusOptions} // already validated existence
            isLoading={isCaseStatusLoading}
          />
        )}
        {table.getColumn("visaClass") && (
          <DataTableFacetedFilter
            column={table.getColumn("visaClass")}
            title="Visa class"
            options={visaClassOptions} // already validated existence
            isLoading={isVisaClassLoading}
          />
        )}
        {table.getColumn("employer.name") && (
          <FilterUsingBackend
            column={table.getColumn("employer.name")!}
            entity={{
              title: "employer",
              idAccessorFn,
              displayAccessorFn,
              countAccessorFn,
            }}
            query={{
              result: employersQueryItems,
              isQueryLoading: isEmployersQueryLoading,
              queryHasNext: employersHasNext ?? false,
            }}
            pagination={{
              state: searchPagination,
              setState: setSearchPagination,
            }}
            search={{
              str: searchStr,
              setStr: setSearchStr,
            }}
            onFilter={(selectedData) => {
              table.getColumn("employer.name")?.setFilterValue(selectedData);
            }}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
