import React from "react";
import { Column } from "@tanstack/react-table";
import { FilterUsingBackend } from "@/components/filter-using-backend";
interface Props<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: { label: string; value: string; count?: number }[];
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onFilter: () => void;
}
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title = "Case status",
  options,
  isLoading,
  error,
  onRetry,
  onFilter,
}: Props<TData, TValue>) {
  const [search, setSearch] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const labels = new Map(options.map((o) => [o.value, o]));
  const result = React.useMemo(
    () =>
      options
        .filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        .map((o) => o.value),
    [options, search],
  );
  if (!column) return null;
  return (
    <FilterUsingBackend
      column={column}
      entity={{
        title,
        idAccessorFn: (v) => v,
        displayAccessorFn: (v) => labels.get(v)?.label ?? v,
        countAccessorFn: (v) => labels.get(v)?.count ?? 0,
      }}
      query={{ result, isQueryLoading: isLoading, error, onRetry }}
      pagination={{ state: pagination, setState: setPagination }}
      search={{ str: search, setStr: setSearch }}
      onFilter={(values) => {
        column.setFilterValue(values.length ? values : undefined);
        onFilter();
      }}
    />
  );
}
