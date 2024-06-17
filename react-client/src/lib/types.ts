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
