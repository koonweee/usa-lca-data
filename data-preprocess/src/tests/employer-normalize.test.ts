import { describe, expect, it } from 'vitest';
import mappings from '../employer-name-mappings.json';
import { buildEmployerLookup, employerMatchingKey, normalizeEmployerName, resolveEmployerName } from '../employer-normalize';

describe('employer normalization', () => {
  it.each(['GOOGLE LLC', 'Google LLC.', ' Google ,  LLC ', '\tGoogle,\u00a0LLC\n'])('resolves %j', (name) => {
    expect(resolveEmployerName(name)).toBe('Google LLC');
    expect(employerMatchingKey(name)).toBe('google llc');
  });

  it('deduplicates unknown employers without lowercasing their display names', () => {
    expect(employerMatchingKey('New Example LLC')).toBe(employerMatchingKey('NEW EXAMPLE LLC.'));
    expect(resolveEmployerName('New Example LLC')).toBe('New Example LLC');
  });

  it('resolves explicit word aliases to the same matching key', () => {
    expect(resolveEmployerName('The Boston Consulting Group, Inc.')).toBe('Boston Consulting Group, Inc.');
    expect(employerMatchingKey('The Boston Consulting Group, Inc.')).toBe(employerMatchingKey('Boston Consulting Group, Inc.'));
    expect(employerMatchingKey('Google Technology Company')).toBe(employerMatchingKey('Google LLC'));
  });

  it('repairs punctuation spacing in existing mappings', () => {
    expect(resolveEmployerName('Energy Management , Inc.')).toBe('Energy Management, Inc.');
    expect(resolveEmployerName('UNITED OVERSEAS BANK , NEW YORK AGENCY')).toBe('United Overseas Bank, New York Agency');
  });

  it('rejects conflicting aliases after normalization, including canonical names', () => {
    expect(() => buildEmployerLookup({ 'First LLC': ['Shared , LLC'], 'Second LLC': ['SHARED LLC.'] })).toThrow('belongs to both');
    expect(() => buildEmployerLookup({ 'First LLC': ['Second LLC'], 'Second LLC': [] })).toThrow('belongs to both');
  });

  it('normalizes lookup aliases and automatically includes canonical names', () => {
    const lookup = buildEmployerLookup({ 'First LLC': [' FIRST , LLC. ', 'Alias LLC.'] });
    expect(lookup.get('first llc')).toBe('First LLC');
    expect(lookup.get('alias llc')).toBe('First LLC');
  });

  it('keeps normalization idempotent and every shipped alias unambiguous', () => {
    expect(() => buildEmployerLookup(mappings)).not.toThrow();
    for (const [canonical, aliases] of Object.entries(mappings)) {
      for (const name of [canonical, ...aliases]) {
        expect(resolveEmployerName(name)).toBe(canonical);
        const key = employerMatchingKey(name);
        expect(normalizeEmployerName(key)).toBe(key);
      }
    }
  });
});
