/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./src/context"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    dateTime<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
    /**
     * The `BigInt` scalar type represents non-fractional signed whole numeric values.
     */
    bigInt<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "BigInt";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    dateTime<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
    /**
     * The `BigInt` scalar type represents non-fractional signed whole numeric values.
     */
    bigInt<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "BigInt";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  LCADisclosureFilters: { // input type
    caseStatus?: NexusGenEnums['casestatus'][] | null; // [casestatus!]
    employerUuid?: string[] | null; // [String!]
    jobTitle?: string[] | null; // [String!]
    visaClass?: NexusGenEnums['visaclass'][] | null; // [visaclass!]
  }
  LCADisclosureOrderByInput: { // input type
    beginDate?: NexusGenEnums['SortOrder'] | null; // SortOrder
    wageRateOfPayFrom?: NexusGenEnums['SortOrder'] | null; // SortOrder
  }
  PaginationInput: { // input type
    skip?: number | null; // Int
    take?: number | null; // Int
  }
}

export interface NexusGenEnums {
  SortOrder: "asc" | "desc"
  casestatus: "Certified" | "Certified___Withdrawn" | "Denied" | "Withdrawn"
  payunit: "Bi_Weekly" | "Hour" | "Month" | "Week" | "Year"
  visaclass: "E_3_Australian" | "H_1B" | "H_1B1_Chile" | "H_1B1_Singapore"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  BigInt: any
  DateTime: any
}

export interface NexusGenObjects {
  CaseStatusAndCount: { // root type
    caseStatus: NexusGenEnums['casestatus']; // casestatus!
    count: number; // Int!
  }
  Employer: { // root type
    city: string; // String!
    count: number; // Int!
    naicsCode: string; // String!
    name: string; // String!
    postalCode: string; // String!
    state?: string | null; // String
    uuid: string; // ID!
  }
  LCADisclosure: { // root type
    beginDate: NexusGenScalars['DateTime']; // DateTime!
    caseNumber: string; // ID!
    caseStatus: NexusGenEnums['casestatus']; // casestatus!
    decisionDate: NexusGenScalars['DateTime']; // DateTime!
    fullTimePosition: boolean; // Boolean!
    jobTitle?: string | null; // String
    prevailingWageRateOfPay?: NexusGenScalars['BigInt'] | null; // BigInt
    prevailingWageRateOfPayUnit?: NexusGenEnums['payunit'] | null; // payunit
    receivedDate: NexusGenScalars['DateTime']; // DateTime!
    socCode: string; // String!
    visaClass: NexusGenEnums['visaclass']; // visaclass!
    wageRateOfPayFrom?: NexusGenScalars['BigInt'] | null; // BigInt
    wageRateOfPayTo?: NexusGenScalars['BigInt'] | null; // BigInt
    wageRateOfPayUnit?: NexusGenEnums['payunit'] | null; // payunit
    worksiteCity?: string | null; // String
    worksitePostalCode?: string | null; // String
    worksiteState?: string | null; // String
  }
  LCADisclosureStats: { // root type
    successPercentage: number; // Float!
    totalCount: number; // Int!
  }
  LCADisclosures: {};
  Mutation: {};
  PaginatedEmployer: { // root type
    hasNext: boolean; // Boolean!
    items: NexusGenRootTypes['Employer'][]; // [Employer!]!
  }
  PaginatedLCADisclosuresUniqueColumnValues: {};
  PresignedUrl: { // root type
    s3key: string; // String!
    url: string; // String!
  }
  Query: {};
  ResumeSubmission: { // root type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    email: string; // String!
    id: string; // String!
    linkedinUrl: string; // String!
    name: string; // String!
    s3key?: string | null; // String
  }
  SOCJob: { // root type
    code: string; // ID!
    title: string; // String!
  }
  StringValuesAndCount: { // root type
    count: number; // Int!
    value: string; // String!
  }
  UniqueCaseStatuses: { // root type
    uniqueValues: NexusGenRootTypes['CaseStatusAndCount'][]; // [CaseStatusAndCount!]!
  }
  UniqueEmployers: { // root type
    hasNext?: boolean | null; // Boolean
    uniqueValues: NexusGenRootTypes['Employer'][]; // [Employer!]!
  }
  UniqueJobTitles: { // root type
    hasNext?: boolean | null; // Boolean
    uniqueValues: NexusGenRootTypes['StringValuesAndCount'][]; // [StringValuesAndCount!]!
  }
  UniqueVisaClasses: { // root type
    uniqueValues: NexusGenRootTypes['VisaClassAndCount'][]; // [VisaClassAndCount!]!
  }
  VisaClassAndCount: { // root type
    count: number; // Int!
    visaClass: NexusGenEnums['visaclass']; // visaclass!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  CaseStatusAndCount: { // field return type
    caseStatus: NexusGenEnums['casestatus']; // casestatus!
    count: number; // Int!
  }
  Employer: { // field return type
    city: string; // String!
    count: number; // Int!
    naicsCode: string; // String!
    name: string; // String!
    postalCode: string; // String!
    state: string | null; // String
    uuid: string; // ID!
  }
  LCADisclosure: { // field return type
    beginDate: NexusGenScalars['DateTime']; // DateTime!
    caseNumber: string; // ID!
    caseStatus: NexusGenEnums['casestatus']; // casestatus!
    decisionDate: NexusGenScalars['DateTime']; // DateTime!
    employer: NexusGenRootTypes['Employer']; // Employer!
    fullTimePosition: boolean; // Boolean!
    jobTitle: string | null; // String
    prevailingWageRateOfPay: NexusGenScalars['BigInt'] | null; // BigInt
    prevailingWageRateOfPayUnit: NexusGenEnums['payunit'] | null; // payunit
    receivedDate: NexusGenScalars['DateTime']; // DateTime!
    socCode: string; // String!
    socJob: NexusGenRootTypes['SOCJob']; // SOCJob!
    visaClass: NexusGenEnums['visaclass']; // visaclass!
    wageRateOfPayFrom: NexusGenScalars['BigInt'] | null; // BigInt
    wageRateOfPayTo: NexusGenScalars['BigInt'] | null; // BigInt
    wageRateOfPayUnit: NexusGenEnums['payunit'] | null; // payunit
    worksiteCity: string | null; // String
    worksitePostalCode: string | null; // String
    worksiteState: string | null; // String
  }
  LCADisclosureStats: { // field return type
    successPercentage: number; // Float!
    totalCount: number; // Int!
  }
  LCADisclosures: { // field return type
    items: NexusGenRootTypes['LCADisclosure'][]; // [LCADisclosure!]!
    stats: NexusGenRootTypes['LCADisclosureStats']; // LCADisclosureStats!
  }
  Mutation: { // field return type
    createResumeSubmission: NexusGenRootTypes['ResumeSubmission']; // ResumeSubmission!
    getPresignedUrl: NexusGenRootTypes['PresignedUrl']; // PresignedUrl!
  }
  PaginatedEmployer: { // field return type
    hasNext: boolean; // Boolean!
    items: NexusGenRootTypes['Employer'][]; // [Employer!]!
  }
  PaginatedLCADisclosuresUniqueColumnValues: { // field return type
    caseStatuses: NexusGenRootTypes['UniqueCaseStatuses']; // UniqueCaseStatuses!
    employers: NexusGenRootTypes['UniqueEmployers']; // UniqueEmployers!
    jobTitles: NexusGenRootTypes['UniqueJobTitles']; // UniqueJobTitles!
    visaClasses: NexusGenRootTypes['UniqueVisaClasses']; // UniqueVisaClasses!
  }
  PresignedUrl: { // field return type
    s3key: string; // String!
    url: string; // String!
  }
  Query: { // field return type
    employers: NexusGenRootTypes['PaginatedEmployer']; // PaginatedEmployer!
    lcaDisclosures: NexusGenRootTypes['LCADisclosures']; // LCADisclosures!
    resumeSubmissions: NexusGenRootTypes['ResumeSubmission'][]; // [ResumeSubmission!]!
    socJobs: NexusGenRootTypes['SOCJob'][]; // [SOCJob!]!
    uniqueColumnValues: NexusGenRootTypes['PaginatedLCADisclosuresUniqueColumnValues']; // PaginatedLCADisclosuresUniqueColumnValues!
  }
  ResumeSubmission: { // field return type
    createdAt: NexusGenScalars['DateTime']; // DateTime!
    email: string; // String!
    id: string; // String!
    linkedinUrl: string; // String!
    name: string; // String!
    s3key: string | null; // String
  }
  SOCJob: { // field return type
    code: string; // ID!
    title: string; // String!
  }
  StringValuesAndCount: { // field return type
    count: number; // Int!
    value: string; // String!
  }
  UniqueCaseStatuses: { // field return type
    uniqueValues: NexusGenRootTypes['CaseStatusAndCount'][]; // [CaseStatusAndCount!]!
  }
  UniqueEmployers: { // field return type
    hasNext: boolean | null; // Boolean
    uniqueValues: NexusGenRootTypes['Employer'][]; // [Employer!]!
  }
  UniqueJobTitles: { // field return type
    hasNext: boolean | null; // Boolean
    uniqueValues: NexusGenRootTypes['StringValuesAndCount'][]; // [StringValuesAndCount!]!
  }
  UniqueVisaClasses: { // field return type
    uniqueValues: NexusGenRootTypes['VisaClassAndCount'][]; // [VisaClassAndCount!]!
  }
  VisaClassAndCount: { // field return type
    count: number; // Int!
    visaClass: NexusGenEnums['visaclass']; // visaclass!
  }
}

export interface NexusGenFieldTypeNames {
  CaseStatusAndCount: { // field return type name
    caseStatus: 'casestatus'
    count: 'Int'
  }
  Employer: { // field return type name
    city: 'String'
    count: 'Int'
    naicsCode: 'String'
    name: 'String'
    postalCode: 'String'
    state: 'String'
    uuid: 'ID'
  }
  LCADisclosure: { // field return type name
    beginDate: 'DateTime'
    caseNumber: 'ID'
    caseStatus: 'casestatus'
    decisionDate: 'DateTime'
    employer: 'Employer'
    fullTimePosition: 'Boolean'
    jobTitle: 'String'
    prevailingWageRateOfPay: 'BigInt'
    prevailingWageRateOfPayUnit: 'payunit'
    receivedDate: 'DateTime'
    socCode: 'String'
    socJob: 'SOCJob'
    visaClass: 'visaclass'
    wageRateOfPayFrom: 'BigInt'
    wageRateOfPayTo: 'BigInt'
    wageRateOfPayUnit: 'payunit'
    worksiteCity: 'String'
    worksitePostalCode: 'String'
    worksiteState: 'String'
  }
  LCADisclosureStats: { // field return type name
    successPercentage: 'Float'
    totalCount: 'Int'
  }
  LCADisclosures: { // field return type name
    items: 'LCADisclosure'
    stats: 'LCADisclosureStats'
  }
  Mutation: { // field return type name
    createResumeSubmission: 'ResumeSubmission'
    getPresignedUrl: 'PresignedUrl'
  }
  PaginatedEmployer: { // field return type name
    hasNext: 'Boolean'
    items: 'Employer'
  }
  PaginatedLCADisclosuresUniqueColumnValues: { // field return type name
    caseStatuses: 'UniqueCaseStatuses'
    employers: 'UniqueEmployers'
    jobTitles: 'UniqueJobTitles'
    visaClasses: 'UniqueVisaClasses'
  }
  PresignedUrl: { // field return type name
    s3key: 'String'
    url: 'String'
  }
  Query: { // field return type name
    employers: 'PaginatedEmployer'
    lcaDisclosures: 'LCADisclosures'
    resumeSubmissions: 'ResumeSubmission'
    socJobs: 'SOCJob'
    uniqueColumnValues: 'PaginatedLCADisclosuresUniqueColumnValues'
  }
  ResumeSubmission: { // field return type name
    createdAt: 'DateTime'
    email: 'String'
    id: 'String'
    linkedinUrl: 'String'
    name: 'String'
    s3key: 'String'
  }
  SOCJob: { // field return type name
    code: 'ID'
    title: 'String'
  }
  StringValuesAndCount: { // field return type name
    count: 'Int'
    value: 'String'
  }
  UniqueCaseStatuses: { // field return type name
    uniqueValues: 'CaseStatusAndCount'
  }
  UniqueEmployers: { // field return type name
    hasNext: 'Boolean'
    uniqueValues: 'Employer'
  }
  UniqueJobTitles: { // field return type name
    hasNext: 'Boolean'
    uniqueValues: 'StringValuesAndCount'
  }
  UniqueVisaClasses: { // field return type name
    uniqueValues: 'VisaClassAndCount'
  }
  VisaClassAndCount: { // field return type name
    count: 'Int'
    visaClass: 'visaclass'
  }
}

export interface NexusGenArgTypes {
  LCADisclosures: {
    items: { // args
      filters?: NexusGenInputs['LCADisclosureFilters'] | null; // LCADisclosureFilters
      pagination?: NexusGenInputs['PaginationInput'] | null; // PaginationInput
      sorting?: NexusGenInputs['LCADisclosureOrderByInput'] | null; // LCADisclosureOrderByInput
    }
    stats: { // args
      filters?: NexusGenInputs['LCADisclosureFilters'] | null; // LCADisclosureFilters
    }
  }
  Mutation: {
    createResumeSubmission: { // args
      email: string; // String!
      linkedinUrl: string; // String!
      name: string; // String!
      s3key?: string | null; // String
    }
    getPresignedUrl: { // args
      fileName: string; // String!
    }
  }
  PaginatedLCADisclosuresUniqueColumnValues: {
    caseStatuses: { // args
      filters?: NexusGenInputs['LCADisclosureFilters'] | null; // LCADisclosureFilters
    }
    employers: { // args
      employerNameSearchStr?: string | null; // String
      filters?: NexusGenInputs['LCADisclosureFilters'] | null; // LCADisclosureFilters
      pagination?: NexusGenInputs['PaginationInput'] | null; // PaginationInput
    }
    jobTitles: { // args
      filters?: NexusGenInputs['LCADisclosureFilters'] | null; // LCADisclosureFilters
      jobTitleSearchStr?: string | null; // String
      pagination?: NexusGenInputs['PaginationInput'] | null; // PaginationInput
    }
    visaClasses: { // args
      filters?: NexusGenInputs['LCADisclosureFilters'] | null; // LCADisclosureFilters
    }
  }
  Query: {
    employers: { // args
      caseStatuses?: NexusGenEnums['casestatus'][] | null; // [casestatus!]
      searchStr?: string | null; // String
      skip?: number | null; // Int
      take: number | null; // Int
      visaClasses?: NexusGenEnums['visaclass'][] | null; // [visaclass!]
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}