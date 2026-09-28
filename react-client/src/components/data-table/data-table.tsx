import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table as TanstackTable,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileDataTableInner } from "@/components/data-table/mobile-data-table-inner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  serverSidePaginationConfig?: {
    rowCount: number;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    pagination: PaginationState;
  };
  serverSideFilteringConfig?: {
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    columnFilters: ColumnFiltersState;
    getFacetedUniqueValues?: typeof getFacetedUniqueValues;
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  };
  toolbar: React.FunctionComponent<{ table: TanstackTable<TData> }>;
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onClear?: () => void;
  defaultHiddenColumnIds?: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  serverSidePaginationConfig,
  serverSideFilteringConfig,
  isLoading,
  error,
  onRetry,
  onClear,
  toolbar,
  defaultHiddenColumnIds,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const initialVisiblity = defaultHiddenColumnIds?.reduce((acc, id) => {
    acc[id] = false;
    return acc;
  }, {});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialVisiblity ?? {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: serverSideFilteringConfig
        ? serverSideFilteringConfig.sorting
        : sorting,
      columnVisibility,
      rowSelection,
      columnFilters: serverSideFilteringConfig
        ? serverSideFilteringConfig.columnFilters
        : columnFilters,
      pagination: serverSidePaginationConfig?.pagination,
    },
    manualPagination: serverSidePaginationConfig ? true : false,
    manualFiltering: serverSideFilteringConfig ? true : false,
    rowCount: serverSidePaginationConfig?.rowCount,
    onRowSelectionChange: setRowSelection,
    onSortingChange: serverSideFilteringConfig
      ? serverSideFilteringConfig.setSorting
      : setSorting,
    onColumnFiltersChange: serverSideFilteringConfig
      ? serverSideFilteringConfig.setColumnFilters
      : setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: serverSideFilteringConfig
      ? undefined
      : getFilteredRowModel(),
    getPaginationRowModel: serverSidePaginationConfig
      ? undefined
      : getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    //getFacetedUniqueValues: serverSideFilteringConfig ? serverSideFilteringConfig.getFacetedUniqueValues() : getFacetedUniqueValues(),
    // getFacetedMinMaxValues: serverSideFilteringConfig ? serverSideFilteringConfig.getFacetedMinMaxValues() : getFacetedMinMaxValues(),
    onPaginationChange: serverSidePaginationConfig
      ? serverSidePaginationConfig.setPagination
      : undefined,
    manualSorting: true,
    autoResetPageIndex: false,
    autoResetAll: false,
  });

  const Toolbar = toolbar;

  const showLoading = isLoading && data.length === 0;
  const state = (
    <ResultsState error={error} onRetry={onRetry} onClear={onClear} />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 xl:gap-3">
      <div className="hidden shrink-0 xl:block xl:px-0">
        <Toolbar table={table} />
      </div>
      {error && data.length > 0 && (
        <div role="alert" className="shrink-0 px-5 text-sm">
          Couldn’t refresh results.{" "}
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
      <div className="min-h-0 flex-1 xl:rounded-md xl:border">
        {/* Desktop data table */}
        <div className="desktop-results xl:block hidden">
          <Table className="table-fixed min-w-[1100px]">
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col
                  key={column.id}
                  style={{
                    width: (
                      {
                        visaClass: "10%",
                        caseStatus: "12%",
                        jobTitle: "16%",
                        "employer.name": "20%",
                        "employer.city": "10%",
                        "employer.state": "5%",
                        startDate: "17%",
                        salary: "10%",
                      } as Record<string, string>
                    )[column.id],
                  }}
                />
              ))}
            </colgroup>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {!showLoading && data.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : showLoading ? (
                <NoDataRows
                  isLoading={isLoading}
                  colCount={
                    table.getAllColumns().length -
                    Object.values(columnVisibility).filter(
                      (isVisible) => !isVisible,
                    ).length
                  }
                  pageSize={table.getState().pagination.pageSize}
                />
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length}>
                    {state}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Mobile data cards */}
        <div className="h-full xl:hidden block">
          <MobileDataTableInner
            table={table}
            isLoading={!!isLoading}
            error={!!error}
            onRetry={onRetry}
            emptyState={state}
          />
        </div>
      </div>
      {/** Mobile view uses infinite scroll */}
      <div className="shrink-0 xl:block hidden">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

export function NoDataRows({
  isLoading,
  colCount,
  pageSize,
}: {
  isLoading?: boolean;
  colCount: number;
  pageSize: number;
}) {
  // Return skeleton rows if loading, else return no data message
  return isLoading ? (
    Array.from({ length: pageSize }).map((_, rowIndex) => (
      <TableRow key={`skeleton-row-${rowIndex}`}>
        {Array.from({ length: colCount }).map((_, colIndex) => (
          <TableCell key={`skeleton-cell-${colIndex}-row-${rowIndex}`}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={colCount} className="h-24 text-center">
        No results.
      </TableCell>
    </TableRow>
  );
}

function ResultsState({
  error,
  onRetry,
  onClear,
}: {
  error?: boolean;
  onRetry?: () => void;
  onClear?: () => void;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className="flex min-h-40 flex-col items-center justify-center gap-2 px-5 py-8 text-center"
    >
      <p className="font-semibold">
        {error ? "Couldn’t load applications" : "No matching applications"}
      </p>
      <p className="text-sm text-muted-foreground">
        {error
          ? "Check your connection and try again."
          : onClear
            ? "Try removing a filter."
            : "No applications are available."}
      </p>
      {error ? (
        <Button onClick={onRetry}>Retry</Button>
      ) : (
        onClear && <Button onClick={onClear}>Clear filters</Button>
      )}
    </div>
  );
}
