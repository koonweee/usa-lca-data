import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterSurface } from "@/components/filter-surface";
import { Pagination } from "@/lib/types";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import React from "react";
import { Column } from "@tanstack/react-table";
export interface FilterUsingBackendProps<T, TData, TValue> {
  column?: Column<TData, TValue>;
  /** Controlled content for the combined mobile sheet. */
  selection?: { value: T[]; onChange: (value: T[]) => void };
  /** Props related to entity T */
  entity: {
    /** What the entity is eg. 'employer' */
    title: string;
    /** Function to get ID from a data entry T*/
    idAccessorFn: (entry: T) => string;
    /** Function to get display value from a data entry T*/
    displayAccessorFn: (entry: T) => string;
    /** Function to get count from a data entry T */
    countAccessorFn?: (entry: T) => number;
  };

  /** Props related to query for T */
  query: {
    /** Data result from current query */
    result: T[];
    error?: boolean;
    onRetry?: () => void;
    /** Whether query is running/loading */
    isQueryLoading?: boolean;
    /** Whether query has next page */
    queryHasNext?: boolean;
  };

  /** Props related to pagination on query for T */
  pagination: {
    /** Current pagination state */
    state: Pagination;
    /** Hook to set pagination state */
    setState: React.Dispatch<React.SetStateAction<Pagination>>;
  };

  /** Props related to search */
  search: {
    /** Current search string */
    str: string;
    /** Hook to set search string */
    setStr: React.Dispatch<React.SetStateAction<string>>;
  };

  /** Hook to call when filter button is clicked */
  onFilter: (selectedData: T[]) => void;
}

export function FilterUsingBackend<T, TData, TValue>(
  props: FilterUsingBackendProps<T, TData, TValue>,
) {
  const { column, entity, query, pagination, search, onFilter } = props;
  const {
    title: rawTitle,
    idAccessorFn: id,
    displayAccessorFn: label,
    countAccessorFn: count,
  } = entity;
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  const committed = (column?.getFilterValue() as T[] | undefined) ?? [];
  const [open, setOpen] = React.useState(false);
  const [localDraft, setLocalDraft] = React.useState<T[]>([]);
  const draft = props.selection?.value ?? localDraft;
  const setDraft = (next: React.SetStateAction<T[]>) => {
    const value = typeof next === "function" ? next(draft) : next;
    if (props.selection) props.selection.onChange(value);
    else setLocalDraft(value);
  };
  const [pages, setPages] = React.useState<Record<number, T[]>>({});
  // Replace first-page results in full; deduplicate only when joining pages.
  React.useEffect(() => {
    if (query.isQueryLoading || query.error) return;
    setPages((previous) =>
      pagination.state.pageIndex === 0
        ? { 0: query.result }
        : { ...previous, [pagination.state.pageIndex]: query.result },
    );
  }, [
    query.result,
    query.isQueryLoading,
    query.error,
    pagination.state.pageIndex,
  ]);
  const results = Array.from(
    new Map(
      Object.values(pages)
        .flat()
        .map((item) => [id(item), item]),
    ).values(),
  );
  const selected = new Set(draft.map(id));
  const changeSearch = (value: string) => {
    if (value !== search.str || pagination.state.pageIndex !== 0) setPages({});
    pagination.setState((p) => ({ ...p, pageIndex: 0 }));
    search.setStr(value);
  };
  const changeOpen = (value: boolean) => {
    if (value) {
      setDraft(committed);
      changeSearch("");
    }
    setOpen(value);
  };
  const toggle = (item: T) =>
    setDraft((previous) =>
      previous.some((x) => id(x) === id(item))
        ? previous.filter((x) => id(x) !== id(item))
        : [...previous, item],
    );
  const option = (item: T) => (
    <label
      key={id(item)}
      className="filter-option flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-base hover:bg-accent xl:min-h-8 xl:text-sm"
    >
      <input
        type="checkbox"
        className="h-[18px] w-[18px] shrink-0 accent-[hsl(var(--primary))]"
        checked={selected.has(id(item))}
        onChange={() => toggle(item)}
      />
      <span className="min-w-0 break-words">{label(item)}</span>
      {count && (
        <span className="ml-auto shrink-0 pl-2 text-xs tabular-nums text-muted-foreground">
          {count(item)}
        </span>
      )}
    </label>
  );
  const content = (
    <>
      <div className="shrink-0 border-b p-3">
        <input
          aria-label={`Search ${title}`}
          placeholder={`Search ${title}`}
          value={search.str}
          onChange={(e) => changeSearch(e.target.value)}
          className="h-11 w-full rounded-md border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring xl:h-9 xl:text-sm"
        />
      </div>
      <div
        className={
          props.selection
            ? ""
            : "min-h-0 flex-1 overflow-y-auto overscroll-contain"
        }
        aria-busy={query.isQueryLoading}
      >
        <p className="px-3 py-2 text-xs text-muted-foreground">
          {draft.length} selected
        </p>
        {draft
          .filter((item) => !results.some((result) => id(result) === id(item)))
          .map(option)}
        {!query.isQueryLoading && !query.error && results.length === 0 && (
          <div
            role="status"
            className="px-3 py-5 text-sm text-muted-foreground"
          >
            No matches found.
            {search.str && (
              <Button variant="ghost" onClick={() => changeSearch("")}>
                Clear search
              </Button>
            )}
          </div>
        )}
        {!query.isQueryLoading && results.map(option)}
        {query.isQueryLoading && (
          <p role="status" className="p-3 text-sm text-muted-foreground">
            Loading…
          </p>
        )}
        {query.error && (
          <div role="alert" className="p-3 text-sm">
            Couldn’t load options.{" "}
            <Button variant="outline" onClick={query.onRetry}>
              Retry
            </Button>
          </div>
        )}
        {query.queryHasNext && !query.isQueryLoading && !query.error && (
          <Button
            variant="ghost"
            className="h-11 w-full"
            onClick={() =>
              pagination.setState((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
            }
          >
            Load more options
          </Button>
        )}
      </div>
    </>
  );
  if (props.selection) return content;
  return (
    <FilterSurface
      title={title}
      open={open}
      onOpenChange={changeOpen}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-11 max-w-full border-dashed xl:h-8"
        >
          <PlusCircledIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="capitalize">{title}</span>
          {committed.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal"
            >
              {committed.length}
            </Badge>
          )}
        </Button>
      }
      footer={
        <>
          <Button
            variant="outline"
            className="h-11 flex-1 xl:h-9"
            onClick={() => setDraft([])}
          >
            Clear
          </Button>
          <Button
            className="h-11 flex-1 xl:h-9"
            onClick={() => {
              onFilter(draft);
              setOpen(false);
            }}
          >
            Apply{draft.length > 0 ? ` (${draft.length})` : ""}
          </Button>
        </>
      }
    >
      {content}
    </FilterSurface>
  );
}
