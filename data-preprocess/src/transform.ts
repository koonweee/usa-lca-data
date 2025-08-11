import { Prisma } from '../../graphql-server/node_modules/@prisma/client';
import { RawLCARecord } from './extract';
import { PrismaCreateInputs } from './types';

/**
 * Data extracted from XLSX are strings. Parse them as needed for DB entity insertion.
 */
export class DataTransformer {
  static parseDate(dateStr: string): Date {
    return new Date(dateStr);
  }

  static parseBigInt(value?: string): bigint | null {
    if (!value) {
      return null
    }
    if (isNaN(Number(value))) {
      throw new Error(`Failed to parse bigInt from ${value}`)
    }
    return BigInt(Math.round(parseFloat(value)));
  }

  /**
   * Base function for mapping a string value to an enum (eg. map raw case status to Prisma case status)
   * Throws if the provided string value does not have a mapping
   */
  static mapEnum<T>(stringValue: string, mapping: Map<string, T>): T {
    const mappedValue = mapping.get(stringValue)
    if (!mappedValue) {
      throw new Error(`Invalid string to enum mapping for string value: ${stringValue} and mapping ${JSON.stringify(mapping, null, 2)}`)
    }
    return mappedValue
  }

  static mapCaseStatus(status: string): Prisma.$LCADisclosurePayload['scalars']['caseStatus'] {
    const mapping = new Map<string, Prisma.$LCADisclosurePayload['scalars']['caseStatus']>([
      ['Certified', 'Certified'],
      ['Certified - Withdrawn', 'Certified___Withdrawn'],
      ['Denied', 'Denied'],
      ['Withdrawn', 'Withdrawn'],
    ]);
    
    return DataTransformer.mapEnum(status, mapping);
  }

  static mapVisaClass(visaClass: string): Prisma.$LCADisclosurePayload['scalars']['visaClass'] {
    const mapping = new Map<string, Prisma.$LCADisclosurePayload['scalars']['visaClass']>([
      ['H-1B', 'H_1B'],
      ['H-1B1 Chile', 'H_1B1_Chile'],
      ['H-1B1 Singapore', 'H_1B1_Singapore'],
      ['E-3 Australian', 'E_3_Australian'],
    ]);
    
    return DataTransformer.mapEnum(visaClass, mapping);
  }

  static mapPayUnit(unit?: string): Prisma.$LCADisclosurePayload['scalars']['wageRateOfPayUnit'] | null {
    if (!unit) {
      return null
    }
    const mapping = new Map<string, Prisma.$LCADisclosurePayload['scalars']['wageRateOfPayUnit']>([
      ['Hour', 'Hour'],
      ['Week', 'Week'],
      ['Bi-Weekly', 'Bi_Weekly'],
      ['Month', 'Month'],
      ['Year', 'Year'],
    ]);
    
    return DataTransformer.mapEnum(unit, mapping);
  }

  private transformForPrisma(record: RawLCARecord): PrismaCreateInputs {
    const { /** Case details */
      CASE_NUMBER,
      CASE_STATUS,
      VISA_CLASS,
      RECEIVED_DATE,
      DECISION_DATE,
      
      /** Job details */
      JOB_TITLE,
      SOC_CODE,
      SOC_TITLE,
      BEGIN_DATE,
    
      /** Wage details */
      WAGE_RATE_OF_PAY_FROM,
      WAGE_RATE_OF_PAY_TO,
      WAGE_UNIT_OF_PAY,
      PREVAILING_WAGE,
      PW_UNIT_OF_PAY,
      
      /** Employer details */
      EMPLOYER_NAME,
      TRADE_NAME_DBA,
      EMPLOYER_ADDRESS1,
      EMPLOYER_ADDRESS2,
      EMPLOYER_CITY,
      EMPLOYER_STATE,
      EMPLOYER_POSTAL_CODE,
      EMPLOYER_COUNTRY,
      EMPLOYER_PROVINCE,
      EMPLOYER_PHONE,
      EMPLOYER_PHONE_EXT,
      NAICS_CODE,
    } = record

    const employer: PrismaCreateInputs['employer'] = {
      naicsCode: NAICS_CODE,
      name: EMPLOYER_NAME,
      city: EMPLOYER_CITY,
      state: EMPLOYER_STATE,
      postalCode: EMPLOYER_POSTAL_CODE,
    }

    const socJob: PrismaCreateInputs['socJob'] = {
      code: SOC_CODE,
      title: SOC_TITLE
    }

    const lcaDisclosure: PrismaCreateInputs['lcaDisclosure'] = {
      caseNumber: CASE_NUMBER,
      jobTitle: JOB_TITLE ?? SOC_TITLE,  
      fullTimePosition: true,
      receivedDate: DataTransformer.parseDate(RECEIVED_DATE),
      decisionDate: DataTransformer.parseDate(DECISION_DATE),
      beginDate: DataTransformer.parseDate(BEGIN_DATE),
      wageRateOfPayFrom: DataTransformer.parseBigInt(WAGE_RATE_OF_PAY_FROM),
      wageRateOfPayTo: DataTransformer.parseBigInt(WAGE_RATE_OF_PAY_TO),
      prevailingWageRateOfPay: DataTransformer.parseBigInt(PREVAILING_WAGE),
      // TODO: This OR will not work properly (it will error out of first one is invalid)
      wageRateOfPayUnit: DataTransformer.mapPayUnit(WAGE_UNIT_OF_PAY) || DataTransformer.mapPayUnit(PW_UNIT_OF_PAY),
      caseStatus: DataTransformer.mapCaseStatus(CASE_STATUS),
      visaClass: DataTransformer.mapVisaClass(VISA_CLASS),
    };

    return {
      employer,
      socJob,
      lcaDisclosure
    }
  }

  async transformData(rawRecords: RawLCARecord[]): Promise<PrismaCreateInputs[]> {
    console.log(`Transforming ${rawRecords.length} raw records...`);
    return rawRecords.map(this.transformForPrisma)
  }
}
