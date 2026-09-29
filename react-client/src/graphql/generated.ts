import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: bigint; output: bigint; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: Date | string; output: Date | string; }
};

export type CaseStatusAndCount = {
  __typename?: 'CaseStatusAndCount';
  caseStatus: Casestatus;
  count: Scalars['Int']['output'];
};

export type DataCoverage = {
  __typename?: 'DataCoverage';
  end?: Maybe<FiscalQuarter>;
  lastSeededAt?: Maybe<Scalars['DateTime']['output']>;
  seededQuarterCount: Scalars['Int']['output'];
  start?: Maybe<FiscalQuarter>;
};

export type Employer = {
  __typename?: 'Employer';
  city: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  naicsCode: Scalars['String']['output'];
  name: Scalars['String']['output'];
  normalizedCity: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  postalCodeValid: Scalars['Boolean']['output'];
  state?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['ID']['output'];
};

export type FiscalQuarter = {
  __typename?: 'FiscalQuarter';
  fiscalYear: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  quarter: Scalars['Int']['output'];
};

export type LcaDisclosure = {
  __typename?: 'LCADisclosure';
  beginDate: Scalars['DateTime']['output'];
  caseNumber: Scalars['ID']['output'];
  caseStatus: Casestatus;
  decisionDate: Scalars['DateTime']['output'];
  employer: Employer;
  fullTimePosition: Scalars['Boolean']['output'];
  jobTitle?: Maybe<Scalars['String']['output']>;
  normalizedWorksiteCity?: Maybe<Scalars['String']['output']>;
  prevailingWageRateOfPay?: Maybe<Scalars['BigInt']['output']>;
  prevailingWageRateOfPayUnit?: Maybe<Payunit>;
  receivedDate: Scalars['DateTime']['output'];
  socCode: Scalars['String']['output'];
  socJob: SocJob;
  visaClass: Visaclass;
  wageRateOfPayFrom?: Maybe<Scalars['BigInt']['output']>;
  wageRateOfPayTo?: Maybe<Scalars['BigInt']['output']>;
  wageRateOfPayUnit?: Maybe<Payunit>;
  worksiteCity?: Maybe<Scalars['String']['output']>;
  worksitePostalCode?: Maybe<Scalars['String']['output']>;
  worksitePostalCodeValid?: Maybe<Scalars['Boolean']['output']>;
  worksiteState?: Maybe<Scalars['String']['output']>;
};

export type LcaDisclosureFilters = {
  caseStatus?: InputMaybe<Array<Casestatus>>;
  employerUuid?: InputMaybe<Array<Scalars['String']['input']>>;
  jobTitle?: InputMaybe<Array<Scalars['String']['input']>>;
  visaClass?: InputMaybe<Array<Visaclass>>;
};

export type LcaDisclosureOrderByInput = {
  beginDate?: InputMaybe<SortOrder>;
  wageRateOfPayFrom?: InputMaybe<SortOrder>;
};

export type LcaDisclosureStats = {
  __typename?: 'LCADisclosureStats';
  successPercentage: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type LcaDisclosures = {
  __typename?: 'LCADisclosures';
  items: Array<LcaDisclosure>;
  stats: LcaDisclosureStats;
};


export type LcaDisclosuresItemsArgs = {
  filters?: InputMaybe<LcaDisclosureFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sorting?: InputMaybe<LcaDisclosureOrderByInput>;
};


export type LcaDisclosuresStatsArgs = {
  filters?: InputMaybe<LcaDisclosureFilters>;
};

export type PaginatedLcaDisclosuresUniqueColumnValues = {
  __typename?: 'PaginatedLCADisclosuresUniqueColumnValues';
  /** Unique case statuses in the result set for a given filter */
  caseStatuses: UniqueCaseStatuses;
  /** Unique employers in the result set for a given filter */
  employers: UniqueEmployers;
  /** Unique job titles in the result set for a given filter */
  jobTitles: UniqueJobTitles;
};


export type PaginatedLcaDisclosuresUniqueColumnValuesCaseStatusesArgs = {
  filters?: InputMaybe<LcaDisclosureFilters>;
};


export type PaginatedLcaDisclosuresUniqueColumnValuesEmployersArgs = {
  employerNameSearchStr?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<LcaDisclosureFilters>;
  pagination?: InputMaybe<PaginationInput>;
};


export type PaginatedLcaDisclosuresUniqueColumnValuesJobTitlesArgs = {
  filters?: InputMaybe<LcaDisclosureFilters>;
  jobTitleSearchStr?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<PaginationInput>;
};

export type PaginationInput = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  dataCoverage: DataCoverage;
  lcaDisclosures: LcaDisclosures;
  uniqueColumnValues: PaginatedLcaDisclosuresUniqueColumnValues;
};

export type SocJob = {
  __typename?: 'SOCJob';
  code: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type StringValuesAndCount = {
  __typename?: 'StringValuesAndCount';
  count: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type UniqueCaseStatuses = {
  __typename?: 'UniqueCaseStatuses';
  uniqueValues: Array<CaseStatusAndCount>;
};

export type UniqueEmployers = {
  __typename?: 'UniqueEmployers';
  hasNext?: Maybe<Scalars['Boolean']['output']>;
  uniqueValues: Array<Employer>;
};

export type UniqueJobTitles = {
  __typename?: 'UniqueJobTitles';
  hasNext?: Maybe<Scalars['Boolean']['output']>;
  uniqueValues: Array<StringValuesAndCount>;
};

export enum Casestatus {
  Certified = 'Certified',
  CertifiedWithdrawn = 'Certified___Withdrawn',
  Denied = 'Denied',
  Withdrawn = 'Withdrawn'
}

export enum Payunit {
  BiWeekly = 'Bi_Weekly',
  Hour = 'Hour',
  Month = 'Month',
  Week = 'Week',
  Year = 'Year'
}

export enum Visaclass {
  E_3Australian = 'E_3_Australian',
  H_1B = 'H_1B',
  H_1B1Chile = 'H_1B1_Chile',
  H_1B1Singapore = 'H_1B1_Singapore'
}

export type DataCoverageQueryVariables = Exact<{ [key: string]: never; }>;


export type DataCoverageQuery = { __typename?: 'Query', dataCoverage: { __typename?: 'DataCoverage', seededQuarterCount: number, lastSeededAt?: Date | string | null, start?: { __typename?: 'FiscalQuarter', fiscalYear: number, quarter: number, label: string } | null, end?: { __typename?: 'FiscalQuarter', fiscalYear: number, quarter: number, label: string } | null } };

export type PaginatedLcaDisclosuresQueryVariables = Exact<{
  filters?: InputMaybe<LcaDisclosureFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sorting?: InputMaybe<LcaDisclosureOrderByInput>;
}>;


export type PaginatedLcaDisclosuresQuery = { __typename?: 'Query', lcaDisclosures: { __typename?: 'LCADisclosures', items: Array<{ __typename?: 'LCADisclosure', caseNumber: string, jobTitle?: string | null, socCode: string, fullTimePosition: boolean, receivedDate: Date | string, decisionDate: Date | string, beginDate: Date | string, worksitePostalCode?: string | null, wageRateOfPayFrom?: bigint | null, wageRateOfPayTo?: bigint | null, prevailingWageRateOfPay?: bigint | null, worksiteCity?: string | null, worksiteState?: string | null, wageRateOfPayUnit?: Payunit | null, prevailingWageRateOfPayUnit?: Payunit | null, caseStatus: Casestatus, visaClass: Visaclass, employer: { __typename?: 'Employer', city: string, naicsCode: string, name: string, postalCode: string, state?: string | null, uuid: string }, socJob: { __typename?: 'SOCJob', code: string, title: string } }>, stats: { __typename?: 'LCADisclosureStats', totalCount: number, successPercentage: number } } };

export type PaginatedUniqueEmployersQueryVariables = Exact<{
  filters?: InputMaybe<LcaDisclosureFilters>;
  pagination?: InputMaybe<PaginationInput>;
  employerNameSearchStr?: InputMaybe<Scalars['String']['input']>;
}>;


export type PaginatedUniqueEmployersQuery = { __typename?: 'Query', uniqueColumnValues: { __typename?: 'PaginatedLCADisclosuresUniqueColumnValues', employers: { __typename?: 'UniqueEmployers', hasNext?: boolean | null, uniqueValues: Array<{ __typename?: 'Employer', city: string, naicsCode: string, name: string, postalCode: string, state?: string | null, uuid: string, count: number }> } } };

export type PaginatedUniqueJobTitlesQueryVariables = Exact<{
  filters?: InputMaybe<LcaDisclosureFilters>;
  pagination?: InputMaybe<PaginationInput>;
  jobTitleSearchStr?: InputMaybe<Scalars['String']['input']>;
}>;


export type PaginatedUniqueJobTitlesQuery = { __typename?: 'Query', uniqueColumnValues: { __typename?: 'PaginatedLCADisclosuresUniqueColumnValues', jobTitles: { __typename?: 'UniqueJobTitles', hasNext?: boolean | null, uniqueValues: Array<{ __typename?: 'StringValuesAndCount', value: string, count: number }> } } };

export type UniqueCaseStatusesQueryVariables = Exact<{
  filters?: InputMaybe<LcaDisclosureFilters>;
}>;


export type UniqueCaseStatusesQuery = { __typename?: 'Query', uniqueColumnValues: { __typename?: 'PaginatedLCADisclosuresUniqueColumnValues', caseStatuses: { __typename?: 'UniqueCaseStatuses', uniqueValues: Array<{ __typename?: 'CaseStatusAndCount', caseStatus: Casestatus, count: number }> } } };


export const DataCoverageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DataCoverage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataCoverage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"start"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"quarter"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"end"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fiscalYear"}},{"kind":"Field","name":{"kind":"Name","value":"quarter"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seededQuarterCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastSeededAt"}}]}}]}}]} as unknown as DocumentNode<DataCoverageQuery, DataCoverageQueryVariables>;
export const PaginatedLcaDisclosuresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaginatedLcaDisclosures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureOrderByInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lcaDisclosures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"sorting"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseNumber"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"socCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullTimePosition"}},{"kind":"Field","name":{"kind":"Name","value":"receivedDate"}},{"kind":"Field","name":{"kind":"Name","value":"decisionDate"}},{"kind":"Field","name":{"kind":"Name","value":"beginDate"}},{"kind":"Field","name":{"kind":"Name","value":"worksitePostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayFrom"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayTo"}},{"kind":"Field","name":{"kind":"Name","value":"prevailingWageRateOfPay"}},{"kind":"Field","name":{"kind":"Name","value":"worksiteCity"}},{"kind":"Field","name":{"kind":"Name","value":"worksiteState"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayUnit"}},{"kind":"Field","name":{"kind":"Name","value":"prevailingWageRateOfPayUnit"}},{"kind":"Field","name":{"kind":"Name","value":"caseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"visaClass"}},{"kind":"Field","name":{"kind":"Name","value":"employer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"naicsCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"socJob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"successPercentage"}}]}}]}}]}}]} as unknown as DocumentNode<PaginatedLcaDisclosuresQuery, PaginatedLcaDisclosuresQueryVariables>;
export const PaginatedUniqueEmployersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaginatedUniqueEmployers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employerNameSearchStr"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueColumnValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"employerNameSearchStr"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employerNameSearchStr"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"naicsCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]}}]} as unknown as DocumentNode<PaginatedUniqueEmployersQuery, PaginatedUniqueEmployersQueryVariables>;
export const PaginatedUniqueJobTitlesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaginatedUniqueJobTitles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobTitleSearchStr"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueColumnValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobTitles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobTitleSearchStr"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobTitleSearchStr"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]}}]} as unknown as DocumentNode<PaginatedUniqueJobTitlesQuery, PaginatedUniqueJobTitlesQueryVariables>;
export const UniqueCaseStatusesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UniqueCaseStatuses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueColumnValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseStatuses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UniqueCaseStatusesQuery, UniqueCaseStatusesQueryVariables>;