import { CommandItem } from "@/components/ui/command";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";

export function EntriesCommandItems<T>({
  dataToDisplay,
  idAccessorFn,
  displayAccessorFn,
  setSelectedData,
  isDataLoading = false,
}: {
  dataToDisplay: T[];
  idAccessorFn: (entry: T) => string;
  displayAccessorFn: (entry: T) => string;
  setSelectedData: React.Dispatch<React.SetStateAction<T[]>>;
  isDataLoading?: boolean;
}) {
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
    return (
      <CommandItem
        key={idAccessorFn(data)}
        onSelect={() => {
          setSelectedData((prev) => {
            return [...prev, data];
          });
        }}
        value={idAccessorFn(data)}
      >
        <div
          className={cn(
            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
            "opacity-50 [&_svg]:invisible"
          )}
        >
          <CheckIcon className={cn("h-4 w-4")} />
        </div>
        <span>{displayAccessorFn(data)}</span>
      </CommandItem>
    );
  });
}
