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
  jobTitleSearchStr?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Array<LcaDisclosureOrderByInput>>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
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

export type PaginatedLcaDisclosuresQueryVariables = Exact<{
  orderBy?: InputMaybe<Array<LcaDisclosureOrderByInput> | LcaDisclosureOrderByInput>;
  take?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PaginatedLcaDisclosuresQuery = { __typename?: 'Query', lcaDisclosures: { __typename?: 'LCADisclosures', count: number, items: Array<{ __typename?: 'LCADisclosure', receivedDate: Date | string, beginDate: Date | string, visaClass: Visaclass, wageRateOfPayFrom?: bigint | null, employer: { __typename?: 'Employer', name: string } }> } };


export const PaginatedLcaDisclosuresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"paginatedLCADisclosures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureOrderByInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lcaDisclosures"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"receivedDate"}},{"kind":"Field","name":{"kind":"Name","value":"beginDate"}},{"kind":"Field","name":{"kind":"Name","value":"visaClass"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayFrom"}}]}}]}}]}}]} as unknown as DocumentNode<PaginatedLcaDisclosuresQuery, PaginatedLcaDisclosuresQueryVariables>;