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

export type CaseStatusAndCount = {
  __typename?: 'CaseStatusAndCount';
  caseStatus: Casestatus;
  count: Scalars['Int']['output'];
};

export type Employer = {
  __typename?: 'Employer';
  city: Scalars['String']['output'];
  count: Scalars['Int']['output'];
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

export type LcaDisclosures = {
  __typename?: 'LCADisclosures';
  items: Array<LcaDisclosure>;
  totalCount: Scalars['Int']['output'];
};


export type LcaDisclosuresItemsArgs = {
  filters?: InputMaybe<LcaDisclosureFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sorting?: InputMaybe<LcaDisclosureOrderByInput>;
};


export type LcaDisclosuresTotalCountArgs = {
  filters?: InputMaybe<LcaDisclosureFilters>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createResumeSubmission: ResumeSubmission;
  getPresignedUrl: PresignedUrl;
};


export type MutationCreateResumeSubmissionArgs = {
  email: Scalars['String']['input'];
  linkedinUrl: Scalars['String']['input'];
  name: Scalars['String']['input'];
  s3key?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGetPresignedUrlArgs = {
  fileName: Scalars['String']['input'];
};

export type PaginatedEmployer = {
  __typename?: 'PaginatedEmployer';
  hasNext: Scalars['Boolean']['output'];
  items: Array<Employer>;
};

export type PaginatedLcaDisclosuresUniqueColumnValues = {
  __typename?: 'PaginatedLCADisclosuresUniqueColumnValues';
  /** Unique case statuses in the result set for a given filter */
  caseStatuses: UniqueCaseStatuses;
  /** Unique employers in the result set for a given filter */
  employers: UniqueEmployers;
  /** Unique job titles in the result set for a given filter */
  jobTitles: UniqueJobTitles;
  /** Unique visa classes in the result set for a given filter */
  visaClasses: UniqueVisaClasses;
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


export type PaginatedLcaDisclosuresUniqueColumnValuesVisaClassesArgs = {
  filters?: InputMaybe<LcaDisclosureFilters>;
};

export type PaginationInput = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type PresignedUrl = {
  __typename?: 'PresignedUrl';
  s3key: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  employers: PaginatedEmployer;
  lcaDisclosures: LcaDisclosures;
  resumeSubmissions: Array<ResumeSubmission>;
  socJobs: Array<SocJob>;
  uniqueColumnValues: PaginatedLcaDisclosuresUniqueColumnValues;
};


export type QueryEmployersArgs = {
  caseStatuses?: InputMaybe<Array<Casestatus>>;
  searchStr?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  visaClasses?: InputMaybe<Array<Visaclass>>;
};

export type ResumeSubmission = {
  __typename?: 'ResumeSubmission';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  linkedinUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
  s3key?: Maybe<Scalars['String']['output']>;
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

export type UniqueVisaClasses = {
  __typename?: 'UniqueVisaClasses';
  uniqueValues: Array<VisaClassAndCount>;
};

export type VisaClassAndCount = {
  __typename?: 'VisaClassAndCount';
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

export type CreateResumeSubmissionMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  linkedinUrl: Scalars['String']['input'];
  s3key?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateResumeSubmissionMutation = { __typename?: 'Mutation', createResumeSubmission: { __typename?: 'ResumeSubmission', id: string, name: string, email: string, linkedinUrl: string, s3key?: string | null, createdAt: Date | string } };

export type GetPresignedUrlMutationVariables = Exact<{
  fileName: Scalars['String']['input'];
}>;


export type GetPresignedUrlMutation = { __typename?: 'Mutation', getPresignedUrl: { __typename?: 'PresignedUrl', url: string, s3key: string } };

export type PaginatedLcaDisclosuresQueryVariables = Exact<{
  filters?: InputMaybe<LcaDisclosureFilters>;
  pagination?: InputMaybe<PaginationInput>;
  sorting?: InputMaybe<LcaDisclosureOrderByInput>;
}>;


export type PaginatedLcaDisclosuresQuery = { __typename?: 'Query', lcaDisclosures: { __typename?: 'LCADisclosures', totalCount: number, items: Array<{ __typename?: 'LCADisclosure', caseNumber: string, jobTitle?: string | null, socCode: string, fullTimePosition: boolean, receivedDate: Date | string, decisionDate: Date | string, beginDate: Date | string, worksitePostalCode?: string | null, wageRateOfPayFrom?: bigint | null, wageRateOfPayTo?: bigint | null, prevailingWageRateOfPay?: bigint | null, worksiteCity?: string | null, worksiteState?: string | null, wageRateOfPayUnit?: Payunit | null, prevailingWageRateOfPayUnit?: Payunit | null, caseStatus: Casestatus, visaClass: Visaclass, employer: { __typename?: 'Employer', city: string, naicsCode: string, name: string, postalCode: string, state?: string | null, uuid: string }, socJob: { __typename?: 'SOCJob', code: string, title: string } }> } };

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

export type UniqueVisaClassesQueryVariables = Exact<{
  filters?: InputMaybe<LcaDisclosureFilters>;
}>;


export type UniqueVisaClassesQuery = { __typename?: 'Query', uniqueColumnValues: { __typename?: 'PaginatedLCADisclosuresUniqueColumnValues', visaClasses: { __typename?: 'UniqueVisaClasses', uniqueValues: Array<{ __typename?: 'VisaClassAndCount', visaClass: Visaclass, count: number }> } } };


export const CreateResumeSubmissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateResumeSubmission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"linkedinUrl"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"s3key"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createResumeSubmission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"linkedinUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"linkedinUrl"}}},{"kind":"Argument","name":{"kind":"Name","value":"s3key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"s3key"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"linkedinUrl"}},{"kind":"Field","name":{"kind":"Name","value":"s3key"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateResumeSubmissionMutation, CreateResumeSubmissionMutationVariables>;
export const GetPresignedUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetPresignedUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fileName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPresignedUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fileName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fileName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"s3key"}}]}}]}}]} as unknown as DocumentNode<GetPresignedUrlMutation, GetPresignedUrlMutationVariables>;
export const PaginatedLcaDisclosuresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaginatedLcaDisclosures"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureOrderByInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lcaDisclosures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"sorting"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sorting"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseNumber"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"socCode"}},{"kind":"Field","name":{"kind":"Name","value":"fullTimePosition"}},{"kind":"Field","name":{"kind":"Name","value":"receivedDate"}},{"kind":"Field","name":{"kind":"Name","value":"decisionDate"}},{"kind":"Field","name":{"kind":"Name","value":"beginDate"}},{"kind":"Field","name":{"kind":"Name","value":"worksitePostalCode"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayFrom"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayTo"}},{"kind":"Field","name":{"kind":"Name","value":"prevailingWageRateOfPay"}},{"kind":"Field","name":{"kind":"Name","value":"worksiteCity"}},{"kind":"Field","name":{"kind":"Name","value":"worksiteState"}},{"kind":"Field","name":{"kind":"Name","value":"wageRateOfPayUnit"}},{"kind":"Field","name":{"kind":"Name","value":"prevailingWageRateOfPayUnit"}},{"kind":"Field","name":{"kind":"Name","value":"caseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"visaClass"}},{"kind":"Field","name":{"kind":"Name","value":"employer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"naicsCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"socJob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}]}]}}]}}]} as unknown as DocumentNode<PaginatedLcaDisclosuresQuery, PaginatedLcaDisclosuresQueryVariables>;
export const PaginatedUniqueEmployersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaginatedUniqueEmployers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employerNameSearchStr"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueColumnValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"employerNameSearchStr"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employerNameSearchStr"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"naicsCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"uuid"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]}}]} as unknown as DocumentNode<PaginatedUniqueEmployersQuery, PaginatedUniqueEmployersQueryVariables>;
export const PaginatedUniqueJobTitlesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaginatedUniqueJobTitles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobTitleSearchStr"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueColumnValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobTitles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobTitleSearchStr"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobTitleSearchStr"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}}]}}]}}]}}]} as unknown as DocumentNode<PaginatedUniqueJobTitlesQuery, PaginatedUniqueJobTitlesQueryVariables>;
export const UniqueCaseStatusesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UniqueCaseStatuses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueColumnValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseStatuses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"caseStatus"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UniqueCaseStatusesQuery, UniqueCaseStatusesQueryVariables>;
export const UniqueVisaClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UniqueVisaClasses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LCADisclosureFilters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueColumnValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"visaClasses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"visaClass"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UniqueVisaClassesQuery, UniqueVisaClassesQueryVariables>;