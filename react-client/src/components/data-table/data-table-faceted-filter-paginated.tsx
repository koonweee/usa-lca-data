import * as React from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { useDebounce } from "use-debounce";
import Select, { createFilter } from 'react-select';
import { FixedSizeList as List } from "react-window";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { PopoverClose } from "@radix-ui/react-popover";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilterPaginated<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const columnFilterValue = column?.getFilterValue() as string[];
  const columnFilterValueSet = new Set(columnFilterValue);
  const [currentSelectedValues, setCurrentSelectedValues] =
    React.useState(columnFilterValue);

  React.useEffect(() => {
    setCurrentSelectedValues(columnFilterValue);
  }, [columnFilterValue]);

  const selectedValues = new Set(currentSelectedValues);


  const [search, setSearch] = React.useState('')
  const [debouncedSearchValue] = useDebounce(search, 500);
  const onSearchChange = (searchValue: string) => setSearch(searchValue);

  const isSearching = search.length > 0;

  const searchedOptions = useFuzzySearchList({
    list: options,
    queryText: debouncedSearchValue,
    getText: (option) => [option.label],
    mapResultItem: (item) => item.item,
  })



  const [page, setPage] = React.useState(0);
  const pageSize = 5;
  const startIndex = page * pageSize; // 0, 5, 10, 15, ...
  const endIndex = startIndex + pageSize; // 5, 10, 15, 20, ...
  const paginatedOptions = (isSearching ? searchedOptions : options).slice(startIndex, endIndex);
  const pageCount = Math.ceil(options.length / pageSize);


  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {columnFilterValueSet?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {columnFilterValueSet.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {columnFilterValueSet.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {columnFilterValueSet.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => columnFilterValueSet.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={title} value={search} onValueChange={onSearchChange}/>
          {selectedValues.size > 0 && (
            <>
              <CommandItem
                onSelect={() => setCurrentSelectedValues([])}
                className="justify-center text-center"
              >
                Clear filters
              </CommandItem>
              <CommandSeparator />
            </>
          )}

          <CommandList>
            <CommandGroup>
              { paginatedOptions.map((option, index) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={`${option.value}-${index}`}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      setCurrentSelectedValues(Array.from(selectedValues));
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-fit items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {
              paginatedOptions.length === 0 &&
              <CommandEmpty>No results found.</CommandEmpty>
            }
          </CommandList>
          {
            pageCount > 1 &&
              <>
              <CommandSeparator />
              <CommandItem>
                Page {page + 1} of {pageCount}
              </CommandItem>
              <CommandSeparator />
              <CommandItem
                onSelect={() => setPage(page + 1)}
                disabled={page === pageCount - 1}
              >
                Next
              </CommandItem>
              </>
          }
          <CommandSeparator />
          <PopoverClose>
            <CommandItem
              onSelect={() => {
                const filterValues = Array.from(currentSelectedValues);
                column?.setFilterValue(
                  filterValues.length ? filterValues : undefined
                );
              }}
              className="justify-center text-center"
            >
              Filter
            </CommandItem>
          </PopoverClose>
        </Command>
      </PopoverContent>
    </Popover>
    <Select options={options} isMulti components={{ MenuList }} filterOption={createFilter({ ignoreAccents: false })}/>
    </>
  );
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MenuList({ options, children, maxHeight, getValue}: any) {
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * 35;

    return (
      <List
        height={maxHeight}
        itemCount={children.length}
        itemSize={height}
        initialScrollOffset={initialOffset}
      >
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </List>
    );
}
