import mappings from './employer-name-mappings.json';

/** Remove punctuation before collapsing whitespace so "Google , LLC" also matches. */
export function normalizeEmployerName(name: string): string {
  return name.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();
}

/** Reject ambiguous aliases instead of silently letting the last entry win. */
export function buildEmployerLookup(entries: Record<string, string[]>): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const [canonical, variations] of Object.entries(entries)) {
    for (const variation of [canonical, ...variations]) {
      const key = normalizeEmployerName(variation);
      const existing = lookup.get(key);
      if (existing !== undefined && existing !== canonical) {
        throw new Error(`Employer alias "${key}" belongs to both "${existing}" and "${canonical}"`);
      }
      lookup.set(key, canonical);
    }
  }
  return lookup;
}

const variationToCanonical = buildEmployerLookup(mappings);

/** Preferred display name when known; preserve readable casing for new employers. */
export function resolveEmployerName(name: string): string {
  return variationToCanonical.get(normalizeEmployerName(name)) ?? name.trim();
}

/** Stable identity for both known aliases and employers absent from the mappings. */
export function employerMatchingKey(name: string): string {
  return normalizeEmployerName(resolveEmployerName(name));
}
