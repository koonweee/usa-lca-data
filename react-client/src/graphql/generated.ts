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
  BigInt: { input: bigint; output: bigint; }
  DateTime: { input: Date | string; output: Date | string; }
};

export type CaseStatusFacet = {
  __typename?: 'CaseStatusFacet';
  caseStatus: Casestatus;
  count: Scalars['Int']['output'];
};

export type Employer = {
  __typename?: 'Employer';
  city: Scalars['String']['output'];
  naicsCode: Scalars['String']['output'];
  name: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['ID']['output'];
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
  worksiteState?: Maybe<Scalars['String']['output']>;
};

export type LcaDisclosureOrderByInput = {
  beginDate?: InputMaybe<SortOrder>;
  decisionDate?: InputMaybe<SortOrder>;
  receivedDate?: InputMaybe<SortOrder>;
  wageRateOfPayFrom?: InputMaybe<SortOrder>;
};

export type LcaDisclosures = {
  __typename?: 'LCADisclosures';
  count: Scalars['Int']['output'];
  items: Array<LcaDisclosure>;
  uniqueCaseStatusFacets: Array<CaseStatusFacet>;
  uniqueVisaClassFacets: Array<VisaClassFacet>;
};

export type Query = {
  __typename?: 'Query';
  employers: Array<Employer>;
  lcaDisclosures: LcaDisclosures;
  socJobs: Array<SocJob>;
};


export type QueryEmployersArgs = {
  searchStr?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLcaDisclosuresArgs = {
  beginDateMax?: InputMaybe<Scalars['DateTime']['input']>;
  beginDateMin?: InputMaybe<Scalars['DateTime']['input']>;
  caseStatuses?: InputMaybe<Array<Casestatus>>;
  decisionDateMax?: InputMaybe<Scalars['DateTime']['input']>;
  decisionDateMin?: InputMaybe<Scalars['DateTime']['input']>;
  employerCities?: InputMaybe<Array<Scalars['String']['input']>>;
  employerNameSearchStr?: InputMaybe<Scalars['String']['input']>;
  employerNames?: InputMaybe<Array<Scalars['String']['input']>>;
  employerStates?: InputMaybe<Array<Scalars['String']['input']>>;
  employerUuids?: InputMaybe<Array<Scalars['String']['input']>>;
  jobSOCCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  jobTitleSearchStr?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<LcaDisclosureOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  visaClasses?: InputMaybe<Array<Visaclass>>;
  wageMax?: InputMaybe<Scalars['Int']['input']>;
  wageMin?: InputMaybe<Scalars['Int']['input']>;
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

export type VisaClassFacet = {
  __typename?: 'VisaClassFacet';
  count: Scalars['Int']['output'];
  visaClass: Visaclass;
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

export type AllEmployersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllEmployersQuery = { __typename?: 'Query', employers: Array<{ __typename?: 'Employer', uuid: string, name: string }> };

export type PaginatedLcaDisclosuresQueryVariables = Exact<{
  orderBy?: InputMaybe<Array<LcaDisclosureOrderByInput> | LcaDisclosureOrderByInput>;
  take?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  visaClasses?: InputMaybe<Array<Visaclass> | Visaclass>;
  caseStatuses?: InputMaybe<Array<Casestatus> | Casestatus>;
  wageMin?: InputMaybe<Scalars['Int']['input']>;
  wageMax?: InputMaybe<Scalars['Int']['input']>;
  beginDateMin?: InputMaybe<Scalars['DateTime']['input']>;
  beginDateMax?: InputMaybe<Scalars['DateTime']['input']>;
  decisionDateMin?: InputMaybe<Scalars['DateTime']['input']>;
  decisionDateMax?: InputMaybe<Scalars['DateTime']['input']>;
  employerUuids?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  employerStates?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  employerCities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  employerNames?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  employerNameSearchStr?: InputMaybe<Scalars['String']['input']>;
  jobSocCodes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  jobTitleSearchStr?: InputMaybe<Scalars['String']['input']>;
}>;


export type PaginatedLcaDisclosuresQuery = { __typename?: 'Query', lcaDisclosures: { __typename?: 'LCADisclosures', count: number, uniqueVisaClassFacets: Array<{ __typename?: 'VisaClassFacet', count: number, visaClass: Visaclass }>, uniqueCaseStatusFacets: Array<{ __typename?: 'CaseStatusFacet', caseStatus: Casestatus, count: number }>, items: Array<{ __typename?: 'LCADisclosure', receivedDate: Date | string, beginDate: Date | string, visaClass: Visaclass, wageRateOfPayFrom?: bigint | null, wageRateOfPayUnit?: Payunit | null, jobTitle?: string | null, caseStatus: Casestatus, caseNumber: string, employer: { __typename?: 'Employer', name: string, city: string, state?: string | null }, socJob: { __typename?: 'SOCJob', title: string, code: string } }> } };


export const AllEmployersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"allEmployers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AllEmployersQuery, AllEmployersQueryVariables>;
export const PaginatedLcaDisclosuresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"paginatedLCADisclosures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureOrderByInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"visaClasses"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"visaclass"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"caseStatuses"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"casestatus"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"wageMin"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"wageMax"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beginDateMin"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"beginDateMax"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"decisionDateMin"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"decisionDateMax"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employerUuids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employerStates"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employerCities"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employerNames"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employerNameSearchStr"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobSocCodes"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobTitleSearchStr"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lcaDisclosures"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"visaClasses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"visaClasses"}}},{"kind":"Argument","name":{"kind":"Name","value":"caseStatuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"caseStatuses"}}},{"kind":"Argument","name":{"kind":"Name","value":"wageMin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"wageMin"}}},{"kind":"Argument","name":{"kind":"Name","value":"wageMax"},"value":{"kind":"Variable","name":{"kind":"Name","value":"wageMax"}}},{"kind":"Argument","name":{"kind":"Name","value":"beginDateMin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beginDateMin"}}},{"kind":"Argument","name":{"kind":"Name","value":"beginDateMax"},"value":{"kind":"Variable","name":{"kind":"Name","value":"beginDateMax"}}},{"kind":"Argument","name":{"kind":"Name","value":"decisionDateMin"},"value":{"kind":"Variable","name":{"kind":"Name","value":"decisionDateMin"}}},{"kind":"Argument","name":{"kind":"Name","value":"decisionDateMax"},"value":{"kind":"Variable","name":{"kind":"Name","value":"decisionDateMax"}}},{"kind":"Argument","name":{"kind":"Name","value":"employerUuids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employerUuids"}}},{"kind":"Argument","name":{"kind":"Name","value":"employerStates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employerStates"}}},{"kind":"Argument","name":{"kind":"Name","value":"employerCities"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employerCities"}}},{"kind":"Argument","name":{"kind":"Name","value":"employerNames"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employerNames"}}},{"kind":"Argument","name":{"kind":"Name","value":"employerNameSearchStr"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employerNameSearchStr"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobSOCCodes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobSocCodes"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobTitleSearchStr"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobTitleSearchStr"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"uniqueVisaClassFacets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"visaClass"}}]}},{"kind":"Field","name":{"kind":"Name","value":"uniqueCaseStatusFacets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"socJob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"receivedDate"}},{"kind":"Field","name":{"kind":"Name","value":"beginDate"}},{"kind":"Field","name":{"kind":"Name","value":"visaClass"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayFrom"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayUnit"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"caseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"caseNumber"}}]}}]}}]}}]} as unknown as DocumentNode<PaginatedLcaDisclosuresQuery, PaginatedLcaDisclosuresQueryVariables>;