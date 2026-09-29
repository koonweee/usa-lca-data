import type { Employer } from "@/lib/types";
import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useQuery } from "@apollo/client";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { FilterSurface } from "@/components/filter-surface";
import { FilterUsingBackend } from "@/components/filter-using-backend";
import { ColumnId } from "./columns";
import {
  getCaseStatusFilters,
  getEmployerUuidsFilters,
  getJobTitleFilters,
} from "./lib/filters";
import { CASE_STATUS_ENUM_TO_READABLE } from "@/queries/formatters/lca-disclosure";
import {
  StringValuesAndCount,
  Casestatus,
  Visaclass,
  LcaDisclosureFilters,
  UniqueCaseStatusesDocument,
  PaginatedUniqueEmployersDocument,
  PaginatedUniqueJobTitlesDocument,
} from "@/graphql/generated";

const EMPTY_EMPLOYERS: Employer[] = [];
const EMPTY_TITLES: StringValuesAndCount[] = [];
const FILTERS = [
  { id: ColumnId.CaseStatus, label: "Case status" },
  { id: ColumnId.JobTitle, label: "Job title" },
  { id: ColumnId.EmployerName, label: "Employer" },
];
// Count applied choices, not drafts or the sort order.
function selectionCount(filters: ColumnFiltersState) {
  return filters
    .filter((f) => FILTERS.some((option) => option.id === f.id))
    .reduce(
      (total, f) => total + (Array.isArray(f.value) ? f.value.length : 0),
      0,
    );
}
interface Props {
  filters: ColumnFiltersState;
  sorting: SortingState;
  onApply: (filters: ColumnFiltersState, sorting: SortingState) => void;
}
export function MobileFilters({ filters, sorting, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ColumnFiltersState>([]);
  const [draftSort, setDraftSort] = useState<SortingState>(sorting);
  const [expanded, setExpanded] = useState<string | null>(null);
  const activeCount = selectionCount(filters);
  const queryFilters = useMemo<LcaDisclosureFilters>(
    () => ({
      visaClass: [Visaclass.H_1B1Singapore],
      caseStatus: getCaseStatusFilters(draft),
      jobTitle: getJobTitleFilters(draft),
      employerUuid: getEmployerUuidsFilters(draft),
    }),
    [draft],
  );
  const setValues = (id: string, value: unknown[]) =>
    setDraft((current) => [
      ...current.filter((f) => f.id !== id),
      ...(value.length ? [{ id, value }] : []),
    ]);
  const summary = (id: string) => {
    const values = draft.find((f) => f.id === id)?.value as
      | (string | Employer | StringValuesAndCount)[]
      | undefined;
    if (!values?.length) return "Any";
    const names = values.map((v) =>
      typeof v === "string"
        ? (CASE_STATUS_ENUM_TO_READABLE[v as Casestatus] ?? v)
        : "name" in v
          ? v.name
          : v.value,
    );
    return names.length === 1 ? names[0] : `${names.length} selected`;
  };
  return (
    <FilterSurface
      title="Filters"
      open={open}
      onOpenChange={(value) => {
        if (value) {
          setDraft(filters);
          setDraftSort(sorting);
          setExpanded(null);
        }
        setOpen(value);
      }}
      trigger={
        <Button
          variant="outline"
          className="h-11 shrink-0 gap-2 px-3"
          aria-label={
            activeCount ? `Filters, ${activeCount} active` : "Filters"
          }
        >
          Filters
          {activeCount ? (
            <span
              aria-hidden="true"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold tabular-nums text-primary-foreground"
            >
              {activeCount > 99 ? "99+" : activeCount}
            </span>
          ) : (
            <span className="flex h-5 w-5 items-center justify-center">
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            </span>
          )}
        </Button>
      }
      footer={
        <>
          <Button
            variant="outline"
            className="h-11 flex-1"
            onClick={() => setDraft([])}
          >
            Clear all
          </Button>
          <Button
            className="h-11 flex-1"
            onClick={() => {
              onApply(draft, draftSort);
              setOpen(false);
            }}
          >
            Apply filters
            {selectionCount(draft) ? ` (${selectionCount(draft)})` : ""}
          </Button>
        </>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {FILTERS.map((filter) => (
          <section key={filter.id} className="border-b">
            <button
              type="button"
              className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-expanded={expanded === filter.id}
              aria-controls={`mobile-filter-${filter.id}`}
              onClick={() =>
                setExpanded(expanded === filter.id ? null : filter.id)
              }
            >
              <span className="shrink-0 font-medium">{filter.label}</span>
              <span className="ml-auto min-w-0 truncate text-sm text-muted-foreground">
                {summary(filter.id)}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 transition-transform ${expanded === filter.id ? "rotate-180" : ""}`}
              />
            </button>
            <div
              id={`mobile-filter-${filter.id}`}
              hidden={expanded !== filter.id}
            >
              {expanded === filter.id &&
                (filter.id === ColumnId.CaseStatus ? (
                  <StatusOptions
                    filters={queryFilters}
                    value={
                      (draft.find((f) => f.id === filter.id)
                        ?.value as string[]) ?? []
                    }
                    onChange={(value) => setValues(filter.id, value)}
                  />
                ) : (
                  <RemoteOptions
                    key={filter.id}
                    kind={
                      filter.id === ColumnId.EmployerName
                        ? "employer"
                        : "job title"
                    }
                    filters={queryFilters}
                    value={
                      (draft.find((f) => f.id === filter.id)?.value as (
                        | Employer
                        | StringValuesAndCount
                      )[]) ?? []
                    }
                    onChange={(value) => setValues(filter.id, value)}
                  />
                ))}
            </div>
          </section>
        ))}
        <div className="px-4 py-4">
          <label
            htmlFor="mobile-filter-sort"
            className="mb-2 block font-medium"
          >
            Sort by
          </label>
          <select
            id="mobile-filter-sort"
            className="h-11 w-full rounded-md border bg-background px-3 text-base"
            value={`${draftSort[0]?.id ?? ColumnId.StartDate}:${draftSort[0]?.desc ? "desc" : "asc"}`}
            onChange={(event) => {
              const [id, direction] = event.target.value.split(":");
              setDraftSort([{ id, desc: direction === "desc" }]);
            }}
          >
            <option value="startDate:desc">
              Employment date: newest first
            </option>
            <option value="startDate:asc">Employment date: oldest first</option>
            <option value="salary:desc">Base salary: highest first</option>
            <option value="salary:asc">Base salary: lowest first</option>
          </select>
        </div>
      </div>
    </FilterSurface>
  );
}
function StatusOptions({
  filters,
  value,
  onChange,
}: {
  filters: LcaDisclosureFilters;
  value: string[];
  onChange: (values: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const { data, loading, error, refetch } = useQuery(
    UniqueCaseStatusesDocument,
    { variables: { filters: { ...filters, caseStatus: undefined } } },
  );
  const result = useMemo(
    () =>
      data?.uniqueColumnValues.caseStatuses.uniqueValues
        .filter((v) =>
          CASE_STATUS_ENUM_TO_READABLE[v.caseStatus]
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .map((v) => v.caseStatus) ?? [],
    [data, search],
  );
  return (
    <FilterUsingBackend
      selection={{ value, onChange }}
      entity={{
        title: "Case status",
        idAccessorFn: (v) => v,
        displayAccessorFn: (v) =>
          CASE_STATUS_ENUM_TO_READABLE[v as Casestatus] ?? v,
        countAccessorFn: (v) =>
          data?.uniqueColumnValues.caseStatuses.uniqueValues.find(
            (s) => s.caseStatus === v,
          )?.count ?? 0,
      }}
      query={{
        result,
        isQueryLoading: loading,
        error: !!error,
        onRetry: () => {
          void refetch();
        },
      }}
      pagination={{ state: pagination, setState: setPagination }}
      search={{ str: search, setStr: setSearch }}
      onFilter={onChange}
    />
  );
}
function RemoteOptions({
  kind,
  filters,
  value,
  onChange,
}: {
  kind: "employer" | "job title";
  filters: LcaDisclosureFilters;
  value: (Employer | StringValuesAndCount)[];
  onChange: (values: (Employer | StringValuesAndCount)[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [debounced] = useDebounce(search, 300);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const employer = useQuery(PaginatedUniqueEmployersDocument, {
    skip: kind !== "employer",
    variables: {
      filters: { ...filters, employerUuid: undefined },
      pagination: { take: 20, skip: pagination.pageIndex * 20 },
      employerNameSearchStr: debounced || undefined,
    },
  });
  const job = useQuery(PaginatedUniqueJobTitlesDocument, {
    skip: kind !== "job title",
    variables: {
      filters: { ...filters, jobTitle: undefined },
      pagination: { take: 20, skip: pagination.pageIndex * 20 },
      jobTitleSearchStr: debounced || undefined,
    },
  });
  const query = kind === "employer" ? employer : job;
  const result =
    kind === "employer"
      ? (employer.data?.uniqueColumnValues.employers.uniqueValues ??
        EMPTY_EMPLOYERS)
      : (job.data?.uniqueColumnValues.jobTitles.uniqueValues ?? EMPTY_TITLES);
  return (
    <FilterUsingBackend
      selection={{ value, onChange }}
      entity={{
        title: kind,
        idAccessorFn: (v) => ("uuid" in v ? v.uuid : v.value),
        displayAccessorFn: (v) => ("name" in v ? v.name : v.value),
        countAccessorFn: (v) => v.count,
      }}
      query={{
        result,
        isQueryLoading: query.loading || search !== debounced,
        error: !!query.error,
        onRetry: () => {
          void query.refetch();
        },
        queryHasNext:
          kind === "employer"
            ? (employer.data?.uniqueColumnValues.employers.hasNext ?? false)
            : (job.data?.uniqueColumnValues.jobTitles.hasNext ?? false),
      }}
      pagination={{ state: pagination, setState: setPagination }}
      search={{ str: search, setStr: setSearch }}
      onFilter={onChange}
    />
  );
}
