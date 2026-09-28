import { describe, expect, it } from 'vitest';
import { cleanText, textMatchingKey, normalizeState, normalizePostalCode, isValidUSPostalCode } from '../field-normalize';
import { DataTransformer } from '../transform';

describe('field normalization', () => {
  it('matches casing and Unicode whitespace without merging punctuation or seniority', () => {
    expect(textMatchingKey(' SOFTWARE\u00a0 Engineer  ')).toBe('software engineer');
    expect(cleanText(' Software  Engineer ')).toBe('Software Engineer');
    expect(textMatchingKey('C++ Developer')).not.toBe(textMatchingKey('C Developer'));
    expect(textMatchingKey('Engineer II')).not.toBe(textMatchingKey('Engineer'));
    expect(normalizeState(' ma ')).toBe('MA');
    expect(normalizeState('  ')).toBeNull();
  });
  it.each([
    ['02110', '02110', true], ['021101234', '02110-1234', true],
    [' 02110 1234 ', '02110-1234', true], ['02110 - 1234', '02110-1234', true],
    ['2110', '2110', false], ['2110-1234', '2110-1234', false],
    ['ABC', 'ABC', false], ['', '', false], ['02110-0000', '02110-0000', true],
  ])('preserves digits and validates %j', (source, expected, valid) => {
    const result = normalizePostalCode(source);
    expect(result).toBe(expected);
    expect(isValidUSPostalCode(result)).toBe(valid);
    expect(result.replace(/[^0-9]/g, '')).toBe(source.replace(/[^0-9]/g, ''));
    expect(normalizePostalCode(result)).toBe(result);
  });
  it('retains optional worksite data and flags incomplete ZIPs during import', async () => {
    const [result] = await new DataTransformer().transformData([{
      CASE_NUMBER: 'test', CASE_STATUS: 'Certified', VISA_CLASS: 'H-1B1 Singapore',
      RECEIVED_DATE: '2026-01-01', BEGIN_DATE: '2026-02-01', JOB_TITLE: '  Software  Engineer ',
      SOC_CODE: '15-1252', SOC_TITLE: 'Software Developer', NAICS_CODE: '123',
      EMPLOYER_NAME: 'Test LLC', EMPLOYER_CITY: ' New  York ', EMPLOYER_STATE: ' ny ',
      EMPLOYER_POSTAL_CODE: '100011234', EMPLOYER_ADDRESS1: 'Test', EMPLOYER_COUNTRY: 'UNITED STATES OF AMERICA',
      WORKSITE_CITY: ' Boston ', WORKSITE_STATE: ' ma ', WORKSITE_POSTAL_CODE: '2110',
    }]);
    expect(result.employer).toMatchObject({ city: 'New York', normalizedCity: 'new york', state: 'NY', postalCode: '10001-1234', postalCodeValid: true });
    expect(result.lcaDisclosure).toMatchObject({ jobTitle: 'Software Engineer', normalizedJobTitle: 'software engineer', worksiteCity: 'Boston', normalizedWorksiteCity: 'boston', worksiteState: 'MA', worksitePostalCode: '2110', worksitePostalCodeValid: false });
  });
});
