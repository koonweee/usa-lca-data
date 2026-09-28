import { useLayoutEffect, useState, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCompactLayout } from "@/hooks/use-compact-layout";

/** Shared responsive shell; filter content owns its draft/query state. */
export function FilterSurface({
  title,
  open,
  onOpenChange,
  trigger,
  children,
  footer,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  const mobile = useCompactLayout();
  const [viewport, setViewport] = useState({
    height: window.innerHeight,
    top: 0,
  });
  useLayoutEffect(() => {
    if (!open) return;
    const update = () =>
      setViewport({
        height: window.visualViewport?.height ?? window.innerHeight,
        top: window.visualViewport?.offsetTop ?? 0,
      });
    update();
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open]);
  const actions = (
    <div className="filter-actions flex shrink-0 gap-2 border-t p-3">
      {footer}
    </div>
  );
  if (!mobile)
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align="start"
          collisionPadding={12}
          className="filter-popover flex w-[400px] max-w-[calc(100vw-24px)] flex-col overflow-hidden p-0"
          aria-label={title}
        >
          <div className="shrink-0 border-b px-3 py-2 font-semibold capitalize">
            {title}
          </div>
          {children}
          {actions}
        </PopoverContent>
      </Popover>
    );
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="filter-sheet fixed inset-x-0 z-50 flex flex-col overflow-hidden rounded-t-2xl border bg-background shadow-lg"
          style={{
            top: `calc(${viewport.top}px + max(${Math.min(48, viewport.height * 0.06)}px, env(safe-area-inset-top)))`,
            height: `calc(${viewport.height}px - max(${Math.min(48, viewport.height * 0.06)}px, env(safe-area-inset-top)))`,
          }}
        >
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-1">
            <Dialog.Title className="text-lg font-semibold capitalize">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                className="h-11 w-11 p-0"
                aria-label={`Close ${title}`}
              >
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>
          {children}
          {actions}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
