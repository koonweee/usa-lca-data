import mappings from './employer-name-mappings.json';

/** Trim, collapse whitespace, lowercase, remove periods, remove commas. */
export function normalizeEmployerName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/,/g, '');
}

// Build a lookup from each normalized variation to its canonical name
const variationToCanonical = new Map<string, string>();
for (const [canonical, variations] of Object.entries(mappings)) {
  for (const variation of variations) {
    variationToCanonical.set(variation, canonical);
  }
}

/**
 * Normalize the input, check against manual mappings, return canonical name
 * if found, otherwise return the normalized form.
 */
export function resolveEmployerName(name: string): string {
  const normalized = normalizeEmployerName(name);
  return variationToCanonical.get(normalized) ?? name;
}
