import { RawDiscolsureDataRow } from "./types"

export type IndexToRawDisclosureAttributeMap = { [index: number]: keyof RawDiscolsureDataRow }
export const INDEX_TO_DISCLOSURE_ATTRIBUTE_2023: IndexToRawDisclosureAttributeMap = {
  0: 'caseNumber',
  1: 'caseStatus',
  5: 'visaClass',
  6: 'jobTitle',
  7: 'socCode',
  8: 'socTitle',
  9: 'fullTimePosition',
  2: 'receivedDate',
  3: 'decisionDate',
  10: 'beginDate',
  30: 'employerNaicsCode',
  19: 'employerName',
  23: 'employerCity',
  24: 'employerState',
  25: 'employerPostalCode',
  67: 'worksiteCity',
  69: 'worksiteState',
  70: 'worksitePostalCode',
  71: 'wageRateOfPayFrom',
  72: 'wageRateOfPayTo',
  73: 'wageRateOfPayUnit',
  74: 'prevailingWageRateOfPay',
  75: 'prevailingWageRateOfPayUnit',
}

export type YearToMappingMap = {
  [year: number]: IndexToRawDisclosureAttributeMap
}

export const YEAR_TO_MAPPING_MAP: YearToMappingMap = {
  2023: INDEX_TO_DISCLOSURE_ATTRIBUTE_2023
}

