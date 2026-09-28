import { DataCoverageDocument } from "@/graphql/generated";
import { useQuery } from "@apollo/client";

export function PageFooter() {
  const { data, loading, error } = useQuery(DataCoverageDocument);
  const coverage = data?.dataCoverage;
  const coverageSummary =
    coverage?.start && coverage?.end
      ? `Dataset coverage: FY${coverage.start.fiscalYear} Q${coverage.start.quarter} to FY${coverage.end.fiscalYear} Q${coverage.end.quarter}`
      : loading
        ? "Loading dataset coverage…"
        : error
          ? "Dataset coverage unavailable"
          : "No dataset coverage recorded";
  return (
    <footer className="app-footer shrink-0 px-5 py-2 xl:px-8 xl:py-0">
      <div className="container flex flex-col items-center justify-between gap-0 xl:min-h-16 xl:flex-row xl:gap-4">
        <p
          className="text-center text-xs leading-5 text-muted-foreground xl:order-last xl:text-right xl:text-sm"
          aria-live="polite"
        >
          {coverageSummary}
        </p>
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
