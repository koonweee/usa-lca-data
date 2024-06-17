import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useQuery } from "@apollo/client";
import {
  Employer,
  PaginatedUniqueEmployersDocument,
  PaginatedUniqueEmployersQueryVariables,
} from "@/graphql/generated";
import { FilterUsingBackend } from "@/components/filter-using-backend";
import React from "react";
import { useDebounce } from "use-debounce";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterOptionsMap: Map<
    string,
    { options: { value: string; label: string }[]; isLoading: boolean }
  >;
}

export function DataTableToolbar<TData>({
  table,
  filterOptionsMap,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  /** For employer filters */
  const pageSize = 20;

  const idAccessorFn = (entry: Employer) => entry.uuid;
  const displayAccessorFn = (entry: Employer) => entry.name;

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
    employerNameSearchStr:
      debouncedSearchStr.length > 0 ? debouncedSearchStr : undefined,
    // searchStr: debouncedSearchStr.length > 0 ? debouncedSearchStr : undefined,
  };

  const { loading: isEmployersQueryLoading, data: employersQueryData } =
    useQuery(PaginatedUniqueEmployersDocument, {
      variables: searchQueryVariables,
    });

  const { uniqueColumnValues } = employersQueryData || {};
  const { employers } = uniqueColumnValues || {};
  const {
    hasNext: employersHasNext = false,
    uniqueValues: employersQueryItems = [],
  } = employers || {};

  const [selectedEmployers, setSelectedEmployers] = React.useState<Employer[]>(
    []
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {table.getColumn("caseStatus") &&
          filterOptionsMap.get("caseStatus") && (
            <DataTableFacetedFilter
              column={table.getColumn("caseStatus")}
              title="Case status"
              options={filterOptionsMap.get("caseStatus")!.options} // already validated existence
              isLoading={filterOptionsMap.get("caseStatus")!.isLoading}
            />
          )}
        {table.getColumn("visaClass") && filterOptionsMap.get("visaClass") && (
          <DataTableFacetedFilter
            column={table.getColumn("visaClass")}
            title="Visa class"
            options={filterOptionsMap.get("visaClass")!.options} // already validated existence
            isLoading={filterOptionsMap.get("visaClass")!.isLoading}
          />
        )}
        {table.getColumn("employer.name") && (
          <FilterUsingBackend<Employer>
            entity={{
              text: "employer",
              idAccessorFn,
              displayAccessorFn,
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
            selectedData={selectedEmployers}
            setSelectedData={setSelectedEmployers}
            onFilter={(selectedData) => {
              table
                .getColumn("employer.name")
                ?.setFilterValue(selectedData.map((data) => data.uuid));
            }}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setSelectedEmployers([]);
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
