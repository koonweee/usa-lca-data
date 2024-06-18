import * as React from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";

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
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    count?: number;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  isLoading?: boolean;
  onFilter: () => void;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  isLoading,
  onFilter,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const columnFilterValue = column?.getFilterValue() as string[];
  const columnFilterValueSet = new Set(columnFilterValue);
  const [currentSelectedValues, setCurrentSelectedValues] =
    React.useState(columnFilterValue);

  React.useEffect(() => {
    setCurrentSelectedValues(columnFilterValue);
  }, [columnFilterValue]);

  const selectedValues = new Set(currentSelectedValues);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {columnFilterValueSet?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {isLoading ? (
                <LoadingSpinner className="mr-2 w-4" />
              ) : (
                <>
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
                        .filter((option) =>
                          columnFilterValueSet.has(option.value)
                        )
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
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
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
            <CommandEmpty>No results found.</CommandEmpty>
            {isLoading && (
              <CommandItem>
                <div className="flex w-full justify-center items-center">
                  <LoadingSpinner className="mr-2 w-4" />
                  Loading...
                </div>
              </CommandItem>
            )}
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
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
                    {option.count && (
                      <span className="ml-auto flex h-4 w-fit items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <PopoverClose>
            <CommandItem
              onSelect={() => {
                const filterValues = Array.from(currentSelectedValues);
                column?.setFilterValue(
                  filterValues.length ? filterValues : undefined
                );
                onFilter();
              }}
              className="justify-center text-center"
            >
              Filter
            </CommandItem>
          </PopoverClose>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
