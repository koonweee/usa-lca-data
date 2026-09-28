import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'fs';
import { discoverAvailableQuarters, fetchDol, parseDisclosureLinks, PERFORMANCE_URL, XLSX_CONTENT_TYPE } from '../seed/discovery';
const link = (name: string, dir = '/media/') => `<a href="${dir}${name}">label</a>`;
const q3 = 'LCA_Disclosure_Data_FY2026_Q3.xlsx';
const fixture = readFileSync(__dirname + '/fixtures/dol-disclosures.html', 'utf8');

describe('DOL disclosure discovery', () => {
  it('parses actual hrefs, old and new directories, relative and absolute links; sorts and deduplicates', () => {
    const result = parseDisclosureLinks(fixture, 2025, 2026);
    expect(result.map(x => [x.fiscalYear, x.quarter])).toEqual([[2025, 4], [2026, 3]]);
    expect(result[1].sourceUrl).toBe('https://www.dol.gov//media/'+q3);
  });
  it('filters by requested fiscal years', () => expect(parseDisclosureLinks(fixture, 2025, 2025)).toHaveLength(1));
  it.each(['<html>Access denied</html>', '<html>No files</html>', link('LCA_Worksites_FY2026_Q3.xlsx')])('fails on missing disclosure links', html => {
    expect(() => parseDisclosureLinks(html, 2020, 2026)).toThrow('no recognized');
  });
  it('fails on an empty selected range', () => expect(() => parseDisclosureLinks(fixture, 2027, 2027)).toThrow('no LCA disclosure links in'));
  it('fails on changed disclosure filenames', () => expect(() => parseDisclosureLinks(link('LCA_Disclosure_Data_FY2026.xlsx'), 2020, 2026)).toThrow('Unrecognized'));
  it.each(['https://evil.test/', 'http://www.dol.gov/', 'https://www.dol.gov.evil.test/', 'https://user@www.dol.gov/'])('rejects unapproved disclosure origins', dir => {
    expect(() => parseDisclosureLinks(link(q3, dir), 2020, 2026)).toThrow('approved DOL');
  });
  it('refuses ambiguous releases instead of silently choosing a file', () => expect(() => parseDisclosureLinks(link(q3)+link(q3, '/other/'), 2020, 2026)).toThrow('Conflicting'));
  it('accepts HTML entities and ignores labels, appendices, PDFs, comments and scripts', () => {
    const html = `<!-- ${link(q3)} --><script>${link(q3)}</script>` + link(q3+'?a=1&amp;b=2') + link('LCA_Appendix_A_FY2026_Q3.xlsx') + link('LCA_Record_Layout_FY2026_Q3.pdf');
    expect(parseDisclosureLinks(html, 2026, 2026)[0].sourceUrl).toContain('?a=1&b=2');
  });
  it.each([403, 429, 500])('fails visibly on a blocked/failed page (%s)', async status => {
    const fetcher = vi.fn().mockResolvedValue(new Response('blocked', { status }));
    await expect(discoverAvailableQuarters(2026, 2026, fetcher)).rejects.toThrow(`HTTP ${status}`);
  });
  it.each([404, 403, 500])('fails when a listed download fails (%s)', async status => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(link(q3), { headers: { 'content-type': 'text/html' } })).mockResolvedValueOnce(new Response('', { status }));
    await expect(discoverAvailableQuarters(2026, 2026, fetcher)).rejects.toThrow(`HTTP ${status}`);
  });
  it('rejects an HTML error page returned with HTTP 200 for a spreadsheet', async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(link(q3), { headers: { 'content-type': 'text/html' } }));
    await expect(discoverAvailableQuarters(2026, 2026, fetcher)).rejects.toThrow('not XLSX');
  });
  it('discovers a listed workbook without guessing extra URLs', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(link(q3), { headers: { 'content-type': 'text/html' } })).mockResolvedValueOnce(new Response('PK', { headers: { 'content-type': XLSX_CONTENT_TYPE } }));
    expect(await discoverAvailableQuarters(2026, 2026, fetcher)).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0][0]).toBe(PERFORMANCE_URL);
  });
  it('propagates network/timeouts', async () => {
    await expect(discoverAvailableQuarters(2026, 2026, vi.fn().mockRejectedValue(new Error('timed out')))).rejects.toThrow('timed out');
  });
  it('blocks off-domain redirects before making another request', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://evil.test/file' } }));
    await expect(fetchDol(PERFORMANCE_URL, fetcher)).rejects.toThrow('approved DOL');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('follows approved relative redirects', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: '/new-page' } })).mockResolvedValueOnce(new Response('ok'));
    expect((await fetchDol(PERFORMANCE_URL, fetcher)).status).toBe(200);
    expect(fetcher.mock.calls[1][0]).toBe('https://www.dol.gov/new-page');
  });
});
