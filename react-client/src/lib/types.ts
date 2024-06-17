import type {
  PaginatedLcaDisclosuresQuery,
  PaginatedUniqueEmployersQuery,
} from "../graphql/generated";

export type LCADisclosure =
  PaginatedLcaDisclosuresQuery["lcaDisclosures"]["items"][0];
export type Employer =
  PaginatedUniqueEmployersQuery["uniqueColumnValues"]["employers"]["uniqueValues"][0];

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}

// T is actual value of the filter

export interface FilterConfig {
  title: string;
  isLoading?: boolean;
}

export interface FrontendFilterConfig<T> extends FilterConfig {
  options: { value: T; label: string }[];
}

// export type FilterToolbarConfig = {columnId: string, filterConfig: FrontendFilterConfig};
