export enum CaseStatus {
  CERTIFIED = 'Certified',
  DENIED = 'Denied',
  WITHDRAWN = 'Withdrawn',
  CERTIFIED_WITHDRAWN = 'Certified - Withdrawn',
  NOT_SPECIFIED = 'Not Specified'
}

export enum VisaClass {
  H1B = 'H-1B',
  H1B1_CHILE = 'H-1B1 Chile',
  H1B1_SINGAPORE = 'H-1B1 Singapore',
  E3_AUSTRALIAN = 'E-3 Australian'
}

export enum WageUnitOfPay {
  YEAR = 'Year',
  MONTH = 'Month',
  BI_WEEKLY = 'Bi-Weekly',
  WEEK = 'Week',
  HOUR = 'Hour'
}

export enum PrevailingWageLevel {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  NOT_SPECIFIED = 'Not Specified'
}

export enum StatutoryBasis {
  ANNUAL_WAGE = '$60,000 or higher annual wage',
  MASTERS_DEGREE = 'Masters Degree or higher in related specialty',
  BOTH = 'Both $60,000 or higher in annual wage and Masters Degree or higher in related specialty'
}

export enum PublicDisclosure {
  DISCLOSE_BUSINESS = 'Disclose Business',
  DISCLOSE_EMPLOYMENT = 'Disclose Employment',
  DISCLOSE_BUSINESS_AND_EMPLOYMENT = 'Disclose Business and Employment',
  NOT_SPECIFIED = 'Not Specified'
}

export type DateRange = {
  from?: Date;
  to?: Date;
}

export type LCADisclosure = {
  id: string;
  caseStatus: CaseStatus;
  receivedDate: Date;
  decisionDate: Date;
  originalCertifiedDate?: Date;
  visaClass: VisaClass;
  jobTitle: string;
  socCode: string; // to maintain list of soc codes (& titles?
  socTitle: string;
  fullTimePosition: boolean;
  beginDate: Date;
  endDate: Date;
  totalWorkerPositions: number;
  nNewEmployment?: number;
  nContinuedEmployment?: number;
  nChangePreviousEmployment?: number;
  nNewConcurrentEmployment?: number;
  nChangeEmployer?: number;
  nAmendedPetition?: number;
  employerName: string;
  tradeNameDba?: string;
  employerAddress1: string;
  employerAddress2?: string;
  employerCity: string;
  employerState: string;
  employerPostalCode: string;
  employerCountry: string;
  employerProvince?: string;
  employerPhone: string;
  employerPhoneExt?: string;
  naicsCode: string;
  employerPocLastName: string;
  employerPocFirstName: string;
  employerPocMiddleName?: string;
  employerPocJobTitle: string;
  employerPocAddress1: string;
  employerPocAddress2?: string;
  employerPocCity: string;
  employerPocState: string;
  employerPocPostalCode: string;
  employerPocCountry: string;
  employerPocProvince?: string;
  employerPocPhone: string;
  employerPocPhoneExt?: string;
  employerPocEmail: string;
  agentRepresentingEmployer: boolean;
  agentAttorneyLastName?: string;
  agentAttorneyFirstName?: string;
  agentAttorneyMiddleName?: string;
  agentAttorneyAddress1?: string;
  agentAttorneyAddress2?: string;
  agentAttorneyCity?: string;
  agentAttorneyState?: string;
  agentAttorneyPostalCode?: string;
  agentAttorneyCountry?: string;
  agentAttorneyProvince?: string;
  agentAttorneyPhone?: string;
  agentAttorneyPhoneExt?: string;
  agentAttorneyEmail?: string;
  lawfirmNameBusinessName?: string;
  stateOfHighestCourt?: string;
  nameOfHighestStateCourt?: string;
  nWorksiteWorkers: number;
  secondaryEntity: boolean;
  secondaryEntityBusinessName?: string;
  worksiteAddress1: string;
  worksiteAddress2?: string;
  worksiteCity: string;
  worksiteCounty: string;
  worksiteState: string;
  worksitePostalCode: string;
  wageRateOfPayFrom: number;
  wageRateOfPayTo?: number;
  wageUnitOfPay: WageUnitOfPay;
  prevailingWage: number;
  pwUnitOfPay: WageUnitOfPay;
  pwTrackingNumber?: string;
  pwWageLevel: PrevailingWageLevel;
  pwOesYear?: DateRange;
  pwOtherSource?: string;
  pwOtherYear?: number;
  pwSurveyPublisher?: string;
  pwSurveyName?: string;
  totalWorksiteLocations: number;
  agreeToLcStatement: boolean;
  h1bDependent: boolean;
  willfulViolator: boolean;
  supportH1b?: boolean;
  statutoryBasis?: StatutoryBasis;
  appendixAAttached?: boolean;
  publicDisclosure: PublicDisclosure;
  preparerLastName?: string;
  preparerFirstName?: string;
  preparerMiddleInitial?: string;
  preparerBusinessName?: string;
  preparerEmail?: string;
  searchableText: string;
}

export interface LCAData {
  lcaCaseNumber: string;
  applicationData: ApplicationData;
  jobData: JobData;
  employerData: EmployerData;
  legalData?: LegalData;
  searchableText: string;
}

export interface JobData {
  jobTitle: string;
  socTitle: string;
  baseAnnualSalary: number;
}

export interface ApplicationData {
  caseNumber: string;
  caseStatus: CaseStatus;
  receivedDate: Date;
  decisionDate: Date;
}

export interface EmployerData {
  name: string;
  city: string;
  state: string;
}

export interface LegalData {
  attorneyName: string;
  attorneyFirmName?: string;
}
