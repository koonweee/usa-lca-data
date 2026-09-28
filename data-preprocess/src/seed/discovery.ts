import { parse, DefaultTreeAdapterMap } from 'parse5';

export const PERFORMANCE_URL = 'https://www.dol.gov/agencies/eta/foreign-labor/performance';
export const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; LCA-Data-Seed/1.0)' };
export interface SeedCandidate {
  fiscalYear: number;
  quarter: number;
  sourceUrl: string;
  fileName: string;
}

function approvedUrl(value: string, base = PERFORMANCE_URL): URL {
  const url = new URL(value, base);
  if (url.protocol !== 'https:' || !['www.dol.gov', 'dol.gov'].includes(url.hostname)
      || url.port || url.username || url.password) {
    throw new Error('Disclosure links and redirects must use HTTPS on an approved DOL hostname');
  }
  url.hash = '';
  return url;
}

// Check every redirect before following it, not just the final response URL.
export async function fetchDol(url: string, fetcher: typeof fetch = fetch, timeoutMs = 30_000): Promise<Response> {
  let current = approvedUrl(url);
  const signal = AbortSignal.timeout(timeoutMs);
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const response = await fetcher(current.href, { headers: FETCH_HEADERS, redirect: 'manual', signal });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    await response.body?.cancel();
    const location = response.headers.get('location');
    if (!location) throw new Error(`DOL redirect has no Location: ${current.href}`);
    current = approvedUrl(location, current.href);
  }
  throw new Error('Too many DOL redirects');
}

export function parseDisclosureLinks(html: string, fyStart: number, fyEnd: number): SeedCandidate[] {
  const candidates = new Map<string, SeedCandidate>();
  function visit(node: DefaultTreeAdapterMap['node']): void {
    if ('tagName' in node && node.tagName === 'a') {
      const href = node.attrs.find(attr => attr.name === 'href')?.value;
      if (href) {
        let url: URL;
        try { url = new URL(href, PERFORMANCE_URL); } catch { return; }
        const fileName = decodeURIComponent(url.pathname.split('/').pop() || '');
        // Match the URL, not the label (DOL's current Q3 label contains a typo).
        if (/^LCA_Disclosure.*\.xlsx$/i.test(fileName)) {
          approvedUrl(url.href);
          url.hash = '';
          const match = /^LCA_Disclosure_Data_FY(\d{4})_Q([1-4])\.xlsx$/i.exec(fileName);
          if (!match) throw new Error(`Unrecognized LCA disclosure filename: ${fileName}`);
          const fiscalYear = Number(match[1]);
          const quarter = Number(match[2]);
          const key = `${fiscalYear}-${quarter}`;
          const existing = candidates.get(key);
          if (existing && existing.sourceUrl !== url.href) {
            throw new Error(`Conflicting disclosure URLs for FY${fiscalYear} Q${quarter}`);
          }
          candidates.set(key, { fiscalYear, quarter, sourceUrl: url.href, fileName });
        }
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parse(html));
  if (!candidates.size) throw new Error('DOL page contained no recognized LCA disclosure links; discovery failed');
  const selected = [...candidates.values()].filter(c => c.fiscalYear >= fyStart && c.fiscalYear <= fyEnd)
    .sort((a, b) => a.fiscalYear - b.fiscalYear || a.quarter - b.quarter);
  if (!selected.length) throw new Error(`DOL page has no LCA disclosure links in FY${fyStart}–FY${fyEnd}`);
  return selected;
}

export async function discoverAvailableQuarters(fyStart: number, fyEnd: number, fetcher: typeof fetch = fetch): Promise<SeedCandidate[]> {
  const response = await fetchDol(PERFORMANCE_URL, fetcher);
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
    await response.body?.cancel();
    throw new Error(`Failed to fetch DOL performance page: HTTP ${response.status}, expected HTML`);
  }
  const candidates = parseDisclosureLinks(await response.text(), fyStart, fyEnd);
  for (const candidate of candidates) {
    const file = await fetchDol(candidate.sourceUrl, fetcher);
    const valid = file.status === 200 && file.headers.get('content-type')?.includes(XLSX_CONTENT_TYPE);
    await file.body?.cancel();
    if (!valid) throw new Error(`Listed disclosure is unavailable or not XLSX: ${candidate.sourceUrl} (HTTP ${file.status})`);
  }
  return candidates;
}
