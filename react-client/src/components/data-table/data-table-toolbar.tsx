

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterOptionsMap: Map<string, { value: string, label: string}[]> // columnId -> filterOptions
}

export function DataTableToolbar<TData>({
  table,
  filterOptionsMap
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* <Input
          placeholder="Filter job titles..."
          value={(table.getColumn("jobTitle")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("jobTitle")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        /> */}
        {table.getColumn("caseStatus") && filterOptionsMap.get("caseStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("caseStatus")}
            title="Case status"
            options={filterOptionsMap.get("caseStatus")!} // already validated existence
          />
        )}
        {table.getColumn("visaClass") && filterOptionsMap.get("visaClass") && (
          <DataTableFacetedFilter
            column={table.getColumn("visaClass")}
            title="Visa class"
            options={filterOptionsMap.get("visaClass")!} // already validated existence
          />
        )}
        {table.getColumn("employer.name") && filterOptionsMap.get("employer.name") && (
          <DataTableFacetedFilter
            column={table.getColumn("employer.name")}
            title="Employer"
            options={filterOptionsMap.get("employer.name")!} // already validated existence
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
