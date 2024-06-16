import { Column } from "@tanstack/react-table";
import React from "react";

interface DataTableBackendFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options?: {
    /** Number of items to show per page, defaults to 10 if not specified */
    paginationPageSize?: number;
  };
  /** Function to get an ID from the data entry */
  idAccesorFn: (item: TData) => string;
  /** Function to get a display value from the data entry */
  displayAccesorFn: (item: TData) => string;
}

export function DataTableBackendFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  idAccesorFn,
  displayAccesorFn,
}: DataTableBackendFacetedFilterProps<TData, TValue>): JSX.Element {
  const paginationPageSize = options?.paginationPageSize || 10;
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: paginationPageSize,
  };

  /** State setup */

  // Pagination states (for all results and search results)
  const [pagination, setPagination] = React.useState(initialPaginationState);
  const [searchPagination, setSearchPagination] = React.useState(
    initialPaginationState
  );

  // Queried data states (for all results and search results)
  const [data, setData] = React.useState<TData[]>([]);
  const dataIDsSet = React.useMemo(
    () => new Set(data.map(idAccesorFn)),
    [data, idAccesorFn]
  );

  React.useEffect(() => {});

  const [searchData, setSearchData] = React.useState<TData[]>([]);

  // Selected data state
  const [selectedData, setSelectedData] = React.useState<TData[]>([]);

  return <div />;
}
