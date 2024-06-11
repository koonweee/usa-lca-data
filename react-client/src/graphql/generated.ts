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
  DateTime: { input: Date | string; output: Date | string; }
};

export type Employer = {
  __typename?: 'Employer';
  city: Scalars['String']['output'];
  naicsCode: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export type LcaDisclosure = {
  __typename?: 'LCADisclosure';
  beginDate: Scalars['DateTime']['output'];
  caseNumber: Scalars['ID']['output'];
  caseStatus: Scalars['String']['output'];
  decisionDate: Scalars['DateTime']['output'];
  employer: Employer;
  fullTimePosition: Scalars['Boolean']['output'];
  jobTitle: Scalars['String']['output'];
  prevailingWageRateOfPay: Scalars['Float']['output'];
  prevailingWageRateOfPayUnit: Scalars['String']['output'];
  receivedDate: Scalars['DateTime']['output'];
  socJob: SocJob;
  visaClass: Scalars['String']['output'];
  wageRateOfPayFrom: Scalars['Float']['output'];
  wageRateOfPayTo: Scalars['Float']['output'];
  wageRateOfPayUnit: Scalars['String']['output'];
  worksite: Worksite;
};

export type Query = {
  __typename?: 'Query';
  lcaDisclosures: Array<LcaDisclosure>;
};

export type SocJob = {
  __typename?: 'SOCJob';
  code: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type Worksite = {
  __typename?: 'Worksite';
  city: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export type AllLcaDisclosuresQueryVariables = Exact<{ [key: string]: never; }>;


export type AllLcaDisclosuresQuery = { __typename?: 'Query', lcaDisclosures: Array<{ __typename?: 'LCADisclosure', caseNumber: string, caseStatus: string, visaClass: string, receivedDate: Date | string, employer: { __typename?: 'Employer', name: string, city: string, state: string }, worksite: { __typename?: 'Worksite', city: string, state: string, postalCode: string }, socJob: { __typename?: 'SOCJob', code: string } }> };


export const AllLcaDisclosuresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"allLCADisclosures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lcaDisclosures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseNumber"}},{"kind":"Field","name":{"kind":"Name","value":"caseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"visaClass"}},{"kind":"Field","name":{"kind":"Name","value":"receivedDate"}},{"kind":"Field","name":{"kind":"Name","value":"employer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"worksite"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"socJob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AllLcaDisclosuresQuery, AllLcaDisclosuresQueryVariables>;