import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PaginatedEmployersDocument,
  PaginatedEmployersQuery,
  PaginatedEmployersQueryVariables,
} from "@/graphql/generated";
import { cn } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from "@radix-ui/react-icons";
import React, { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebounce } from "use-debounce";

type Employer = PaginatedEmployersQuery["employers"]["items"][0];

export default function App() {
  // Get paginated employers from the server
  // Search box does async search for options > 3 characters, debouce 500ms
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const queryVariables: PaginatedEmployersQueryVariables = {
    take: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
  };

  const { loading, data } = useQuery(PaginatedEmployersDocument, {
    variables: queryVariables,
  });

  const fakeLog = (text: string) => {
    setFakeConsoleText((prevText) => `${prevText}\n${text}`);
  };

  const [selectedData, setSelectedData] = React.useState<Employer[]>([]);

  const [fakeConsoleText, setFakeConsoleText] = React.useState("");

  const [searchPagination, setSearchPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [searchStr, setSearchStr] = React.useState("");
  const [debouncedSearchStr] = useDebounce(searchStr, 300);

  const isSearching = searchStr.length > 0;

  const searchQueryVariables: PaginatedEmployersQueryVariables = {
    take: searchPagination.pageSize,
    skip: searchPagination.pageIndex * searchPagination.pageSize,
    searchStr: debouncedSearchStr,
  };

  const { loading: loadingSearch, data: searchData } = useQuery(
    PaginatedEmployersDocument,
    {
      variables: searchQueryVariables,
    }
  );

  const [employers, setEmployers] = React.useState<Employer[]>([]);
  const employerUUIDsSet = useMemo(
    () => new Set(employers.map((e) => e.uuid)),
    [employers]
  );

  React.useEffect(() => {
    if (data) {
      const newEmployers = data.employers.items.filter(
        (e) => !employerUUIDsSet.has(e.uuid)
      );
      if (newEmployers.length !== 0) {
        setEmployers((prev) => [...prev, ...newEmployers]);
      }
    }
  }, [data, employerUUIDsSet]);

  const employersHasMore = data?.employers.hasMore ?? false;

  const [searchResults, setSearchResults] = React.useState<Employer[]>([]);
  const searchResultsUUIDsSet = useMemo(
    () => new Set(searchResults.map((e) => e.uuid)),
    [searchResults]
  );

  React.useEffect(() => {
    const searchDataItems = searchData?.employers.items ?? [];
    // If no data and on first page, set search results to empty
    if (!searchData && searchPagination.pageIndex === 0) {
      return setSearchResults([]);
    }

    const newSearchResults = searchDataItems.filter(
      (e) => !searchResultsUUIDsSet.has(e.uuid)
    );
    if (newSearchResults.length !== 0) {
      if (searchPagination.pageIndex === 0) {
        // If new search results and on first page, set search results to new results
        // as this is a new search
        return setSearchResults(newSearchResults);
      }
      // If new search results and not on first page, append to search results as this
      // is a paginated search
      return setSearchResults((prev) => [...prev, ...newSearchResults]);
    }
  }, [
    searchData,
    searchResultsUUIDsSet,
    searchPagination.pageIndex,
    searchResults,
  ]);

  const searchResultsHasMore = searchData?.employers.hasMore ?? false;

  const loader = <Skeleton className="w-full h-5" />;

  const [truncateSelectedData, setTruncateSelectedData] = React.useState(true);

  return (
    <div className="flex flex-col p-8 gap-2 w-[800px]">
      Test page
      <div className="w-[600px] bg-pink-600 p-6">
        <Command shouldFilter={false}>
          {selectedData.length > 0 && (
            <>
              <CommandGroup
                heading={
                  <div className="flex items-center justify-between">
                    <div className="flex flex-row gap-2 items-center">
                      {selectedData.length} selected employers
                    </div>
                    {selectedData.length > 5 && (
                      <Button
                        onClick={() => {
                          setTruncateSelectedData((prev) => !prev);
                        }}
                        variant="link"
                        className="text-xs font-light"
                      >
                        {truncateSelectedData ? (
                          <>
                            Expand
                            <span>
                              <ArrowDownIcon className="ml-2" />
                            </span>
                          </>
                        ) : (
                          <>
                            Collapse
                            <span>
                              <ArrowUpIcon className="ml-2" />
                            </span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                }
              >
                <CommandSeparator />
                {truncateSelectedData ? null : (
                  <>
                    {selectedData.map((entry) => (
                      <CommandItem
                        key={entry.uuid}
                        onSelect={() => {
                          setSelectedData((prev) =>
                            prev.filter((d) => d.uuid !== entry.uuid)
                          );
                        }}
                      >
                        <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        <span>{entry.name}</span>
                      </CommandItem>
                    ))}
                    <CommandSeparator />
                  </>
                )}
              </CommandGroup>
            </>
          )}
          <CommandInput
            placeholder={"Select employers"}
            onValueChange={(str) => {
              // Reset pagination
              setSearchPagination({ pageIndex: 0, pageSize: 10 });
              setSearchStr(str);
            }}
            value={searchStr}
          />
          <CommandList>
            <CommandGroup heading="Employers">
              {isSearching ? (
                <InfiniteScroll
                  dataLength={searchResults.length}
                  next={() => {
                    setSearchPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex + 1,
                    }));
                  }}
                  hasMore={searchResultsHasMore}
                  loader={loader}
                  scrollableTarget=":r3:"
                >
                  <EntriesCommandItems<Employer>
                    dataToDisplay={searchResults}
                    selectedData={selectedData}
                    idAccesorFunction={(entry) => entry.uuid}
                    displayFunction={(entry) => entry.name}
                    setSelectedData={setSelectedData}
                    isDataLoading={loadingSearch}
                  />
                </InfiniteScroll>
              ) : (
                <InfiniteScroll
                  dataLength={employers.length}
                  next={() => {
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex + 1,
                    }));
                  }}
                  hasMore={employersHasMore}
                  loader={loader}
                  scrollableTarget=":r3:"
                >
                  <EntriesCommandItems<Employer>
                    dataToDisplay={employers}
                    selectedData={selectedData}
                    idAccesorFunction={(entry) => entry.uuid}
                    displayFunction={(entry) => entry.name}
                    setSelectedData={setSelectedData}
                    isDataLoading={loading}
                  />
                </InfiniteScroll>
              )}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandItem
            onSelect={() => {
              console.log("Filter");
            }}
            className="justify-center text-center"
          >
            Filter
          </CommandItem>
        </Command>
      </div>
      <div className="text-sm whitespace-break-spaces">
        {loading ? "Loading..." : `${data?.employers.items.length} employers`}
        {`\nPage ${pagination.pageIndex + 1}`}
      </div>
      <Button onClick={() => setFakeConsoleText("")}>Clear console</Button>
      <div className="text-xs whitespace-break-spaces bg-gray-500 text-white font-mono p-4 rounded">
        {fakeConsoleText}
      </div>
    </div>
  );
}

export function EntriesCommandItems<T>({
  dataToDisplay,
  selectedData,
  idAccesorFunction,
  displayFunction,
  setSelectedData,
  isDataLoading = false,
}: {
  dataToDisplay: T[];
  selectedData: T[];
  idAccesorFunction: (entry: T) => string;
  displayFunction: (entry: T) => string;
  setSelectedData: React.Dispatch<React.SetStateAction<T[]>>;
  isDataLoading?: boolean;
}) {
  const selectedDataIDsSet = useMemo(
    () => new Set(selectedData.map(idAccesorFunction)),
    [selectedData, idAccesorFunction]
  );

  // Return no results found if there are no results
  if (dataToDisplay.length === 0) {
    // Return spinner if data is loading
    if (isDataLoading) {
      return (
        <CommandItem>
          <div className="flex w-full justify-center items-center">
            <LoadingSpinner className="mr-2 w-4" />
            Loading...
          </div>
        </CommandItem>
      );
    }
    return <CommandItem>No results found.</CommandItem>;
  }

  return dataToDisplay.map((data) => {
    const id = idAccesorFunction(data);
    const isSelected = selectedDataIDsSet.has(id);
    // Don't show item if it is already selected
    if (isSelected) {
      return null;
    }
    return (
      <CommandItem
        key={id}
        onSelect={() => {
          setSelectedData((prev) => {
            if (isSelected) {
              return prev.filter((d) => idAccesorFunction(d) !== id);
            } else {
              return [...prev, data];
            }
          });
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
        <span>{displayFunction(data)}</span>
      </CommandItem>
    );
  });
}
