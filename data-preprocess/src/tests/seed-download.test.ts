import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { ensureFileDownloaded } from '../seed/runner';
import { XLSX_CONTENT_TYPE } from '../seed/discovery';
const candidate = { fiscalYear: 2026, quarter: 3, sourceUrl: 'https://www.dol.gov/media/LCA_Disclosure_Data_FY2026_Q3.xlsx', fileName: 'LCA_Disclosure_Data_FY2026_Q3.xlsx' };
const dirs: string[] = [];
afterEach(async () => { vi.unstubAllGlobals(); await Promise.all(dirs.splice(0).map(d => rm(d, { recursive: true, force: true }))); });
async function directory() { const d = await mkdtemp(join(tmpdir(), 'lca-download-test-')); dirs.push(d); return d; }
describe('seed download integrity', () => {
  it('rejects fake spreadsheets and removes partial output', async () => {
    const dir = await directory();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Access denied', { headers: { 'content-type': XLSX_CONTENT_TYPE } })));
    await expect(ensureFileDownloaded(candidate, dir)).rejects.toThrow('Invalid XLSX signature');
    expect(await readdir(dir)).toEqual([]);
  });
  it('publishes the cache only after completing the download', async () => {
    const dir = await directory(); const bytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 1]);
    const fetcher = vi.fn().mockResolvedValue(new Response(bytes, { headers: { 'content-type': XLSX_CONTENT_TYPE } }));
    vi.stubGlobal('fetch', fetcher);
    const path = await ensureFileDownloaded(candidate, dir);
    expect(await readFile(path)).toEqual(bytes);
    expect(await readdir(dir)).toEqual([candidate.fileName]);
    await ensureFileDownloaded(candidate, dir);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
