import { Prisma } from '../../graphql-server/node_modules/@prisma/client';
import { z } from 'zod';

export const RawLCADisclosureSchema = z.object({
  /** Case details */
  CASE_NUMBER: z.string(),
  CASE_STATUS: z.string(),
  VISA_CLASS: z.string(),
  RECEIVED_DATE: z.string(),
  DECISION_DATE: z.string(),
  
  /** Job details */
  JOB_TITLE: z.string().optional(),
  SOC_CODE: z.string(),
  SOC_TITLE: z.string(),
  BEGIN_DATE: z.string(),

  /** Wage details */
  WAGE_RATE_OF_PAY_FROM: z.string().optional(),
  WAGE_RATE_OF_PAY_TO: z.string().optional(),
  WAGE_UNIT_OF_PAY: z.string().optional(),
  PREVAILING_WAGE: z.string().optional(),
  PW_UNIT_OF_PAY: z.string().optional(),
  
  /** Employer details */
  EMPLOYER_NAME: z.string(),
  TRADE_NAME_DBA: z.string().optional(),
  EMPLOYER_ADDRESS1: z.string(),
  EMPLOYER_ADDRESS2: z.string().optional(),
  EMPLOYER_CITY: z.string(),
  EMPLOYER_STATE: z.string().optional(),
  EMPLOYER_POSTAL_CODE: z.string(),
  EMPLOYER_COUNTRY: z.string(),
  EMPLOYER_PROVINCE: z.string().optional(),
  EMPLOYER_PHONE: z.string().optional(),
  EMPLOYER_PHONE_EXT: z.string().optional(),
  NAICS_CODE: z.string(),
});

export type RawLCADisclosure = z.infer<typeof RawLCADisclosureSchema>;

/**
 * Encapsulates creation of LCADisclosure, employer, and SOCJob
 * NOTE: For actual DB insert, employer and SOCJob have to be created first for foreign key constraint on LCADisclosure
 */
export interface PrismaCreateInputs {
  employer: Prisma.EmployerCreateInput,
  socJob: Prisma.SOCJobCreateInput,
  lcaDisclosure: Omit<Prisma.LCADisclosureCreateInput, 'employer' | 'socJob'>
}
