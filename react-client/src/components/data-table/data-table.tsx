import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";

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
    getFacetedUniqueValues: typeof getFacetedUniqueValues
    filterOptionsMap: Map<string, { value: string, label: string}[]> // columnId -> filterOptions
  };
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  serverSidePaginationConfig,
  serverSideFilteringConfig,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
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
    onSortingChange: setSorting,
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
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    //getFacetedUniqueValues: serverSideFilteringConfig ? serverSideFilteringConfig.getFacetedUniqueValues() : getFacetedUniqueValues(),
    // getFacetedMinMaxValues: serverSideFilteringConfig ? serverSideFilteringConfig.getFacetedMinMaxValues() : getFacetedMinMaxValues(),
    onPaginationChange: serverSidePaginationConfig ? serverSidePaginationConfig.setPagination : undefined,
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} filterOptionsMap={serverSideFilteringConfig?.filterOptionsMap ?? new Map()}/>
      <div className="rounded-md border">
        <Table>
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
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <NoDataRows isLoading={isLoading} colCount={columns.length} pageSize={table.getState().pagination.pageSize}/>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

export function NoDataRows({ isLoading, colCount, pageSize }: { isLoading?: boolean, colCount: number, pageSize: number}) {
  // Return skeleton rows if loading, else return no data message
  return isLoading ? (
    Array.from({ length: pageSize }).map((_, rowIndex) => (
      <TableRow
        key={`skeleton-row-${rowIndex}`}
      >
        {Array.from({ length: colCount }).map((_, colIndex) => (
          <TableCell key={`skeleton-cell-${colIndex}-row-${rowIndex}`}>
            <Skeleton className="h-5 w-[100px]" />
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
