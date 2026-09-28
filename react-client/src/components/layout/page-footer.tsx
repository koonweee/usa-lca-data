import type { ReactNode } from "react";

export function PageFooter({ coverage }: { coverage?: ReactNode }) {
  return (
    <footer className="app-footer shrink-0 px-5 py-2 xl:px-8 xl:py-0">
      <div className="container flex flex-col items-center justify-between gap-0 xl:min-h-16 xl:flex-row xl:gap-4">
        {coverage}
        <p className="text-balance text-center text-xs leading-5 text-muted-foreground xl:text-left xl:text-sm xl:leading-loose">
          Built by{" "}
          <a
            href={"https://github.com/koonweee"}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Jeremy
          </a>
          {", "}
          <a
            href={"https://github.com/chuyouchia"}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Jacob
          </a>
          {" and "}
          <a
            href={"https://github.com/iamgenechua"}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Gene
          </a>
          .
          <span className="hidden xl:inline">
            {" "}
            Source code is available on{" "}
            <a
              href={"https://github.com/koonweee/usa-lca-data"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </span>
        </p>
      </div>
    </footer>
  );
}
