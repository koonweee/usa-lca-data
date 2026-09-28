import { DataCoverageDocument } from "@/graphql/generated";
import { useQuery } from "@apollo/client";
import { PageFooter } from "./page-footer";

export function DataCoverageFooter() {
  const { data, loading, error } = useQuery(DataCoverageDocument);
  const coverage = data?.dataCoverage;
  const summary = coverage?.start && coverage?.end
    ? `Dataset coverage: FY${coverage.start.fiscalYear} Q${coverage.start.quarter} to FY${coverage.end.fiscalYear} Q${coverage.end.quarter}`
    : loading ? "Loading dataset coverage…"
      : error ? "Dataset coverage unavailable" : "No dataset coverage recorded";
  return (
    <PageFooter coverage={
      <p className="text-center text-xs leading-5 text-muted-foreground xl:order-last xl:text-right xl:text-sm" aria-live="polite">
        {summary}
      </p>
    } />
  );
}
