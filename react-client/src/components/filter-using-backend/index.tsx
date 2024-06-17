import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/lib/types";
import { pluralize } from "@/lib/utils";
import {
  CheckIcon,
  PlusCircledIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@radix-ui/react-icons";
import {
  Command,
  CommandGroup,
  CommandSeparator,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import React, { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { EntriesCommandItems } from "@/components/filter-using-backend/components/entries-command-items";
import { PopoverClose } from "@radix-ui/react-popover";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FilterUsingBackendProps<T> {
  /** Props related to entity T */
  entity: {
    /** What the entity is eg. 'employer' */
    text: string;
    /** Function to get ID from a data entry T*/
    idAccessorFn: (entry: T) => string;
    /** Function to get display value from a data entry T*/
    displayAccessorFn: (entry: T) => string;
  };

  /** Props related to query for T */
  query: {
    /** Data result from current query */
    result: T[];
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

  /** Hook to call when filters are cleared */
  selectedData: T[];
  setSelectedData: React.Dispatch<React.SetStateAction<T[]>>;
  /** Hook to call when filter button is clicked */
  onFilter: (selectedData: T[]) => void;
}

export function FilterUsingBackend<T>(props: FilterUsingBackendProps<T>) {
  const {
    entity: { text: entityText, idAccessorFn, displayAccessorFn },
    query: {
      result: queryResult,
      isQueryLoading = false,
      queryHasNext = false,
    },
    pagination: {
      state: { pageIndex, pageSize },
      setState: setPagination,
    },
    search: { str: searchStr, setStr: setSearchStr },
    selectedData,
    setSelectedData,
    onFilter,
  } = props;

  const [data, setData] = React.useState<T[]>([]);
  const dataIDsSet = useMemo(
    () => new Set(data.map(idAccessorFn)),
    [data, idAccessorFn]
  );

  React.useEffect(() => {
    // Do nothing if loading
    if (!isQueryLoading) {
      // If query is empty and on first page, set data to empty (if not already)
      if (data.length > 0 && queryResult.length === 0 && pageIndex === 0) {
        return setData([]);
      }

      const newQueryResults = queryResult.filter(
        (e) => !dataIDsSet.has(idAccessorFn(e))
      );
      if (newQueryResults.length !== 0) {
        if (pageIndex === 0) {
          // If new search results and on first page, set search results to new results
          // as this is a new search
          return setData(newQueryResults);
        }
        // If new search results and not on first page, append to search results as this
        // is a paginated search
        return setData((prev) => [...prev, ...newQueryResults]);
      }
    }
  }, [
    queryResult,
    dataIDsSet,
    idAccessorFn,
    pageIndex,
    isQueryLoading,
    data.length,
  ]);

  const selectedDataIDsSet = useMemo(
    () => new Set(selectedData.map(idAccessorFn)),
    [selectedData, idAccessorFn]
  );
  const selectedDataCount = selectedData.length;
  const loader = <Skeleton className="w-full h-5" />;

  const [truncateSelectedData, setTruncateSelectedData] = React.useState(false);

  const [scrollContainerRef, setScrollContainerRef] =
    React.useState<HTMLDivElement>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          <span className=" capitalize">{entityText}</span>
          {selectedDataCount > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedDataCount}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedDataCount > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedDataCount} selected
                  </Badge>
                ) : (
                  selectedData
                    .filter((data) =>
                      selectedDataIDsSet.has(idAccessorFn(data))
                    )
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={idAccessorFn(option)}
                        className="rounded-sm px-1 font-normal max-w-[200px]"
                      >
                        <div className="truncate">
                          {displayAccessorFn(option)}
                        </div>
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]" align="start">
        <Command shouldFilter={false}>
          {selectedData.length > 0 && (
            <CommandGroup
              heading={
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-row items-center gap-2">
                    {selectedData.length} selected employers
                    <Button
                      onClick={() => setSelectedData([])}
                      variant={"ghost"}
                      className="text-xs h-[none] py-0.5 px-2 font-light"
                    >
                      Clear
                    </Button>
                  </div>
                  {selectedData.length > 5 && (
                    <Button
                      onClick={() => {
                        setTruncateSelectedData((prev) => !prev);
                      }}
                      variant="link"
                      className="text-xs font-normal py-0 h-[none] px-0"
                    >
                      {truncateSelectedData ? (
                        <>
                          Show
                          <span>
                            <CaretDownIcon className="ml-1" />
                          </span>
                        </>
                      ) : (
                        <>
                          Hide
                          <span>
                            <CaretUpIcon className="ml-1" />
                          </span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              }
            >
              <CommandSeparator alwaysRender />
              {truncateSelectedData ? null : (
                <>
                  {selectedData.map((entry) => (
                    <CommandItem
                      key={idAccessorFn(entry)}
                      onSelect={() => {
                        setSelectedData((prev) =>
                          prev.filter(
                            (d) => idAccessorFn(d) !== idAccessorFn(entry)
                          )
                        );
                      }}
                      value={idAccessorFn(entry)}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>{displayAccessorFn(entry)}</span>
                    </CommandItem>
                  ))}
                  <CommandSeparator alwaysRender />
                </>
              )}
            </CommandGroup>
          )}
          <CommandInput
            placeholder={`Select ${pluralize(0, entityText)}`}
            onValueChange={(str) => {
              // Reset pagination to first page
              setPagination({
                pageIndex: 0,
                pageSize,
              });
              setSearchStr(str);
            }}
            value={searchStr}
          />
          <CommandList
            style={{
              maxHeight: Math.ceil(pageSize * 17.5),
              overscrollBehavior: "contain",
            }}
            ref={(ref) => {
              setScrollContainerRef(ref ?? undefined);
            }}
          >
            <CommandGroup
              heading={
                <div className="flex flex-row items-center justify-between capitalize">
                  {pluralize(0, entityText)}
                  {isQueryLoading && <LoadingSpinner className="w-3 h-3" />}
                </div>
              }
            >
              {scrollContainerRef && (
                <InfiniteScroll
                  dataLength={data.length - selectedData.length}
                  next={() => {
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex + 1,
                    }));
                  }}
                  hasMore={queryHasNext}
                  loader={loader}
                  scrollableTarget={scrollContainerRef.id}
                  scrollThreshold={0.9}
                >
                  <EntriesCommandItems<T>
                    // Selected employers are shown above the search results
                    dataToDisplay={data.filter(
                      (e) => !selectedDataIDsSet.has(idAccessorFn(e))
                    )}
                    idAccessorFn={idAccessorFn}
                    displayAccessorFn={displayAccessorFn}
                    setSelectedData={setSelectedData}
                    // isDataLoading={isQueryLoading}
                  />
                </InfiniteScroll>
              )}
              {isQueryLoading && (
                <CommandItem>
                  <div className="flex w-full justify-center items-center">
                    <LoadingSpinner className="mr-2 w-4" />
                    Loading...
                  </div>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
          <CommandSeparator alwaysRender />
          <PopoverClose>
            <CommandItem
              onSelect={() => {
                onFilter(selectedData);
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
