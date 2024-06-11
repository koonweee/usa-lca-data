

import type { PaginatedLcaDisclosuresQuery } from "./graphql/generated"

export type LCADisclosure = PaginatedLcaDisclosuresQuery["lcaDisclosures"]['items'][0]
export type Employer = LCADisclosure["employer"]
