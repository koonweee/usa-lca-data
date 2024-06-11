

import type { AllLcaDisclosuresQuery } from "./graphql/generated"

export type LCADisclosure = AllLcaDisclosuresQuery["lcaDisclosures"][0]
export type Employer = LCADisclosure["employer"]
export type Worksite = LCADisclosure["worksite"]
