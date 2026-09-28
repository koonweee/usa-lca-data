/** Matching rules preserve punctuation, seniority, and every postal-code digit. */
export const cleanText = (value: string): string => value.replace(/\s+/g, ' ').trim();
export const textMatchingKey = (value: string): string => cleanText(value).toLowerCase();
export const normalizeState = (value?: string | null): string | null =>
  value == null || cleanText(value) === '' ? null : cleanText(value).toUpperCase();

export function normalizePostalCode(value: string): string {
  const cleaned = cleanText(value);
  const extended = /^(\d{5}) *-? *(\d{4})$/.exec(cleaned);
  return extended ? `${extended[1]}-${extended[2]}` : cleaned;
}

/** Format validation only: does not claim a ZIP exists or infer missing zeroes. */
export const isValidUSPostalCode = (value: string): boolean => /^\d{5}(-\d{4})?$/.test(value);
