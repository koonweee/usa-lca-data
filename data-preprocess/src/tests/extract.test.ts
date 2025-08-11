import { describe, it, expect, vi } from 'vitest';
import { Extract } from '../extract';
import { RawLCADisclosure } from '../types';

describe('Extract', () => {
  describe('createColumnMapping', () => {
    it('should create correct column mapping from headers', () => {
      const headers = [
        'CASE_NUMBER', 'CASE_STATUS', 'VISA_CLASS', 'RECEIVED_DATE', 'DECISION_DATE',
        'JOB_TITLE', 'SOC_CODE', 'SOC_TITLE', 'BEGIN_DATE',
        'WAGE_RATE_OF_PAY_FROM', 'WAGE_RATE_OF_PAY_TO', 'WAGE_UNIT_OF_PAY', 
        'PREVAILING_WAGE', 'PW_UNIT_OF_PAY',
        'EMPLOYER_NAME', 'TRADE_NAME_DBA', 'EMPLOYER_ADDRESS1', 'EMPLOYER_ADDRESS2',
        'EMPLOYER_CITY', 'EMPLOYER_STATE', 'EMPLOYER_POSTAL_CODE', 'EMPLOYER_COUNTRY',
        'EMPLOYER_PROVINCE', 'EMPLOYER_PHONE', 'EMPLOYER_PHONE_EXT', 'NAICS_CODE'
      ];

      // Access private method via type casting
      const createColumnMapping = (Extract as any).createColumnMapping;
      const mapping = createColumnMapping(headers);

      expect(mapping.CASE_NUMBER).toBe(0);
      expect(mapping.EMPLOYER_NAME).toBe(14);
      expect(mapping.NAICS_CODE).toBe(25);
    });

    it('should throw error when required columns are missing', () => {
      const incompleteHeaders = ['CASE_NUMBER', 'CASE_STATUS'];

      const createColumnMapping = (Extract as any).createColumnMapping;
      
      expect(() => {
        createColumnMapping(incompleteHeaders);
      }).toThrow('Missing required columns');
    });
  });

  describe('rowToRawLCADisclosure', () => {
    const mockColumnMapping = {
      CASE_NUMBER: 0,
      CASE_STATUS: 1,
      VISA_CLASS: 2,
      RECEIVED_DATE: 3,
      DECISION_DATE: 4,
      JOB_TITLE: 5,
      SOC_CODE: 6,
      SOC_TITLE: 7,
      BEGIN_DATE: 8,
      WAGE_RATE_OF_PAY_FROM: 9,
      WAGE_RATE_OF_PAY_TO: 10,
      WAGE_UNIT_OF_PAY: 11,
      PREVAILING_WAGE: 12,
      PW_UNIT_OF_PAY: 13,
      EMPLOYER_NAME: 14,
      TRADE_NAME_DBA: 15,
      EMPLOYER_ADDRESS1: 16,
      EMPLOYER_ADDRESS2: 17,
      EMPLOYER_CITY: 18,
      EMPLOYER_STATE: 19,
      EMPLOYER_POSTAL_CODE: 20,
      EMPLOYER_COUNTRY: 21,
      EMPLOYER_PROVINCE: 22,
      EMPLOYER_PHONE: 23,
      EMPLOYER_PHONE_EXT: 24,
      NAICS_CODE: 25,
    };

    it('should convert valid row to RawLCADisclosure', () => {
      const validRow = [
        'I-200-12345678-123456', // CASE_NUMBER
        'Certified', // CASE_STATUS
        'H-1B', // VISA_CLASS
        '2024-01-15', // RECEIVED_DATE
        '2024-02-01', // DECISION_DATE
        'Software Engineer', // JOB_TITLE
        '15-1132', // SOC_CODE
        'Software Developers', // SOC_TITLE
        '2024-03-01', // BEGIN_DATE
        '85000', // WAGE_RATE_OF_PAY_FROM
        '95000', // WAGE_RATE_OF_PAY_TO
        'Year', // WAGE_UNIT_OF_PAY
        '80000', // PREVAILING_WAGE
        'Year', // PW_UNIT_OF_PAY
        'Tech Corp Inc', // EMPLOYER_NAME
        'Tech Corp', // TRADE_NAME_DBA
        '123 Tech St', // EMPLOYER_ADDRESS1
        'Suite 100', // EMPLOYER_ADDRESS2
        'San Francisco', // EMPLOYER_CITY
        'CA', // EMPLOYER_STATE
        '94105', // EMPLOYER_POSTAL_CODE
        'UNITED STATES OF AMERICA', // EMPLOYER_COUNTRY
        '', // EMPLOYER_PROVINCE
        '415-555-0123', // EMPLOYER_PHONE
        '1001', // EMPLOYER_PHONE_EXT
        '541511', // NAICS_CODE
      ];

      const rowToRawLCADisclosure = (Extract as any).rowToRawLCADisclosure;
      const result = rowToRawLCADisclosure(validRow, mockColumnMapping);

      expect(result.CASE_NUMBER).toBe('I-200-12345678-123456');
      expect(result.CASE_STATUS).toBe('Certified');
      expect(result.VISA_CLASS).toBe('H-1B');
      expect(result.JOB_TITLE).toBe('Software Engineer');
      expect(result.EMPLOYER_NAME).toBe('Tech Corp Inc');
      expect(result.NAICS_CODE).toBe('541511');
    });

    it('should handle undefined values by converting to empty string', () => {
      const rowWithUndefined = new Array(26).fill(undefined);
      rowWithUndefined[0] = 'I-200-12345678-123456'; // CASE_NUMBER
      rowWithUndefined[1] = 'Certified'; // CASE_STATUS
      rowWithUndefined[2] = 'H-1B'; // VISA_CLASS
      rowWithUndefined[3] = '2024-01-15'; // RECEIVED_DATE
      rowWithUndefined[4] = '2024-02-01'; // DECISION_DATE
      rowWithUndefined[5] = 'Software Engineer'; // JOB_TITLE
      rowWithUndefined[6] = '15-1132'; // SOC_CODE
      rowWithUndefined[7] = 'Software Developers'; // SOC_TITLE
      rowWithUndefined[8] = '2024-03-01'; // BEGIN_DATE
      rowWithUndefined[14] = 'Tech Corp Inc'; // EMPLOYER_NAME
      rowWithUndefined[15] = 'Tech Corp'; // TRADE_NAME_DBA
      rowWithUndefined[16] = '123 Tech St'; // EMPLOYER_ADDRESS1
      rowWithUndefined[18] = 'San Francisco'; // EMPLOYER_CITY
      rowWithUndefined[20] = '94105'; // EMPLOYER_POSTAL_CODE
      rowWithUndefined[21] = 'UNITED STATES OF AMERICA'; // EMPLOYER_COUNTRY
      rowWithUndefined[25] = '541511'; // NAICS_CODE

      const rowToRawLCADisclosure = (Extract as any).rowToRawLCADisclosure;
      const result = rowToRawLCADisclosure(rowWithUndefined, mockColumnMapping);

      expect(result.CASE_NUMBER).toBe('I-200-12345678-123456');
      expect(result.WAGE_RATE_OF_PAY_FROM).toBeUndefined();
      expect(result.EMPLOYER_ADDRESS2).toBeUndefined();
    });

    it('should throw error for invalid data that fails Zod validation', () => {
      // Create a row that will fail validation (missing required fields)
      const invalidRow = new Array(26).fill('');
      invalidRow[0] = null; // CASE_NUMBER as null should fail

      const rowToRawLCADisclosure = (Extract as any).rowToRawLCADisclosure;
      
      expect(() => {
        rowToRawLCADisclosure(invalidRow, mockColumnMapping);
      }).toThrow('Row validation failed');
    });
  });

  describe('extractData', () => {
    it('should reject with error for non-existent file', async () => {
      await expect(Extract.extractData('non-existent-file.xlsx'))
        .rejects
        .toThrow('Failed to read XLSX file');
    });
  });
});