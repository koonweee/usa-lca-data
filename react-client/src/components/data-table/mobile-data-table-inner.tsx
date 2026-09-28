import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Casestatus } from "@/graphql/generated";
import { cn } from "@/lib/utils";
import { CASE_STATUS_ENUM_TO_READABLE } from "@/queries/formatters/lca-disclosure";
import { Row } from "@tanstack/react-table";
import { Table } from "@tanstack/table-core";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export function MobileDataTableInner<TData>(props: {
  table: Table<TData>;
  isLoading: boolean;
  error: boolean;
  onRetry?: () => void;
  emptyState: React.ReactNode;
}): React.ReactNode {
  const { table } = props;

  const tableRows = table.getRowModel().rows;
  const nTableRows = tableRows.length;
  const tableHasRows = nTableRows > 0;
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [fades, setFades] = React.useState({ top: false, bottom: false });

  React.useLayoutEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      "#scroll-area-viewport",
    );
    if (!viewport) return;
    const update = () => {
      const top = tableHasRows && viewport.scrollTop > 1;
      const bottom =
        tableHasRows &&
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop > 1;
      setFades((previous) =>
        previous.top === top && previous.bottom === bottom
          ? previous
          : { top, bottom },
      );
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    if (viewport.firstElementChild)
      observer.observe(viewport.firstElementChild);
    return () => {
      viewport.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [tableHasRows]);

  return (
    <div className="relative h-full">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full rounded-md overscroll-contain"
        id="scroll-area"
      >
        {tableHasRows ? (
          <InfiniteScroll
            dataLength={nTableRows}
            next={() => {
              if (!props.isLoading && !props.error) table.nextPage();
            }}
            hasMore={!props.error && table.getCanNextPage()}
            loader={
              <div className="flex justify-center items-center w-full h-12">
                <LoadingSpinner className="mr-2" />
                Loading...
              </div>
            }
            scrollableTarget={"scroll-area-viewport"}
            scrollThreshold={0.5}
          >
            {table.getRowModel().rows.map((row) => (
              <DataCard key={row.id} row={row} />
            ))}
            {!props.isLoading && !props.error && table.getCanNextPage() && (
              <Button
                variant="ghost"
                className="h-11 w-full"
                onClick={() => table.nextPage()}
              >
                Load more applications
              </Button>
            )}
            {props.error && (
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={props.onRetry}
              >
                Retry loading more
              </Button>
            )}
          </InfiniteScroll>
        ) : props.isLoading ? (
          <LoadingSkeleton />
        ) : (
          props.emptyState
        )}
      </ScrollArea>
      <div
        aria-hidden="true"
        className={cn(
          "card-scroll-fade card-scroll-fade-top",
          fades.top ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "card-scroll-fade card-scroll-fade-bottom",
          fades.bottom ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

const DATA_CARD_LAYOUT_LEFT = [
  "jobTitle",
  "salary",
  "employer.name",
  ["employer.city", "employer.state"],
  "visaClass",
];

const DATA_CARD_LAYOUT_RIGHT = ["caseStatus", null, null, null, "startDate"];

export function DataCard<TData>(props: {
  row: Row<TData>;
}): JSX.Element | null {
  const { row } = props;
  const visibleCells = row.getVisibleCells();
  if (!visibleCells.length) {
    return null;
  }

  const cardRows = DATA_CARD_LAYOUT_LEFT.map((leftLayoutItem, index) => {
    const rightLayoutItem =
      index < DATA_CARD_LAYOUT_RIGHT.length
        ? DATA_CARD_LAYOUT_RIGHT[index]
        : null;
    const leftIds = Array.isArray(leftLayoutItem)
      ? leftLayoutItem
      : [leftLayoutItem];
    const rightIds = rightLayoutItem
      ? Array.isArray(rightLayoutItem)
        ? rightLayoutItem
        : [rightLayoutItem]
      : [];
    const leftCells = leftIds
      .map((id) => {
        return visibleCells.find((cell) => cell.column.id === id);
      })
      .filter((cell) => !!cell);
    const rightCells = rightIds
      .map((id) => {
        return visibleCells.find((cell) => cell.column.id === id);
      })
      .filter((cell) => !!cell);
    return (
      <div
        key={index}
        className="flex min-w-0 flex-row justify-between items-center gap-2"
      >
        <div className="flex min-w-0 flex-row gap-1 items-center">
          {leftCells.map((cell) => {
            const renderValue = cell!.getValue() as string;
            const columnId = cell!.column.id;
            return (
              <FieldRender key={cell!.id} id={columnId} value={renderValue} />
            );
          })}
        </div>
        <div className="flex flex-row gap-1 items-center">
          {rightCells.map((cell) => {
            const renderValue = cell!.getValue() as string;
            const columnId = cell!.column.id;
            return (
              <FieldRender key={cell!.id} id={columnId} value={renderValue} />
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col items-center pt-4 gap-4 px-5">
      <div className="flex flex-col gap-1 w-full">{cardRows}</div>
      <Separator className="w-full" />
    </div>
  );
}

export function LoadingSkeleton(): JSX.Element {
  // Make 10 skeleton cards
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center pt-4 gap-4 px-5">
          <div className="flex flex-col gap-1 w-full">
            <SkeletonCard cardIndex={index} />
          </div>
          <Separator className="w-full" />
        </div>
      ))}
    </>
  );
}

const SkeletonCard = ({ cardIndex }: { cardIndex: number }) =>
  [...Array(DATA_CARD_LAYOUT_LEFT.length)].map((_, index) => (
    <div
      key={index}
      className="flex min-w-0 flex-row justify-between items-center gap-2"
    >
      <Skeleton
        key={`card-${cardIndex}-left-${index}-skeleton`}
        className={cn("h-5", index < 2 ? "w-[70%]" : "w-[30%]")}
      />
      {DATA_CARD_LAYOUT_RIGHT[index] !== null && (
        <Skeleton
          key={`card-${cardIndex}-right-${index}-skeleton`}
          className="h-5 w-[10%]"
        />
      )}
    </div>
  ));

export function FieldRender(props: { id: string; value: string }): JSX.Element {
  const { id, value } = props;

  if (id === "jobTitle") {
    // Header
    return <div className="text-base font-semibold break-words">{value}</div>;
  }

  if (id === "caseStatus") {
    // Badge
    let variant: "default" | "destructive" | "secondary" | "outline" =
      "default";
    if (value === CASE_STATUS_ENUM_TO_READABLE[Casestatus.Denied]) {
      variant = "destructive";
    }
    if (
      value === CASE_STATUS_ENUM_TO_READABLE[Casestatus.Withdrawn] ||
      value === CASE_STATUS_ENUM_TO_READABLE[Casestatus.CertifiedWithdrawn]
    ) {
      variant = "outline";
    }

    return (
      <Badge variant={variant} className="h-fit">
        {value}
      </Badge>
    );
  }

  // if (id === "visaClass") {
  //   // Badge with default variant
  //   return <Badge className="h-fit">{value}</Badge>;
  // }

  return (
    <div className="text-sm w-auto break-words">
      {value}
      {id === "employer.city" ? ", " : ""}
    </div>
  );
}
