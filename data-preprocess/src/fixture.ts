import type { RawLCADisclosure } from "./types"

/** Column names we want to extract from the excel files */
export const COLUMN_NAMES_TO_EXTRACT: Record<keyof RawLCADisclosure, null> =  {
  /** Case details */
  CASE_NUMBER: null,
  CASE_STATUS: null,
  VISA_CLASS: null,
  RECEIVED_DATE: null,
  DECISION_DATE: null,
  
  /** Job details */
  JOB_TITLE: null,
  SOC_CODE: null,
  SOC_TITLE: null,
  BEGIN_DATE: null,

  /** Wage details */
  WAGE_RATE_OF_PAY_FROM: null,
  WAGE_RATE_OF_PAY_TO: null,
  WAGE_UNIT_OF_PAY: null,
  PREVAILING_WAGE: null,
  PW_UNIT_OF_PAY: null,
  
  /** Employer details */
  EMPLOYER_NAME: null,
  TRADE_NAME_DBA: null,
  EMPLOYER_ADDRESS1: null,
  EMPLOYER_ADDRESS2: null,
  EMPLOYER_CITY: null,
  EMPLOYER_STATE: null,
  EMPLOYER_POSTAL_CODE: null,
  EMPLOYER_COUNTRY: null,
  EMPLOYER_PROVINCE: null,
  EMPLOYER_PHONE: null,
  EMPLOYER_PHONE_EXT: null,
  NAICS_CODE: null,

}
