#!/usr/bin/env tsx
/**
 * Download all DOL XLSX files (in parallel), scan them for H-1B1 Singapore
 * employer names (in parallel), and update employer-name-mappings.json
 * with suggested names for all employers.
 *
 * Usage:
 *   npx tsx src/scripts/update-employer-mappings.ts
 *
 * Downloads go to data-preprocess/raw_xlsx/ (gitignored).
 * After running, review the changes to employer-name-mappings.json and commit.
 */
import { createWriteStream } from 'fs';
import { mkdir, access, readFile, unlink, writeFile } from 'fs/promises';
import { constants } from 'fs';
import { join, dirname } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { getXlsxStream } from 'xlstream';
import { normalizeEmployerName } from '../employer-normalize';

const DOL_BASE_URL = 'https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs';
const SCRIPT_DIR = typeof __dirname !== 'undefined' ? __dirname : dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = join(SCRIPT_DIR, '..', '..');
const DOWNLOAD_DIR = join(PROJECT_ROOT, 'raw_xlsx');
const MAPPINGS_PATH = join(PROJECT_ROOT, 'src', 'employer-name-mappings.json');
const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; LCA-Data-Seed/1.0)',
  'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*',
};
const DEFAULT_FY_START = 2020;
const DOWNLOAD_CONCURRENCY = 5;
const SCAN_CONCURRENCY = 1;

interface FileInfo {
  fiscalYear: number;
  quarter: number;
  url: string;
  fileName: string;
  localPath: string;
}

// --- Download helpers ---

async function isValidXlsx(path: string): Promise<boolean> {
  try {
    const buf = await readFile(path);
    return buf.length >= 2 && buf[0] === 0x50 && buf[1] === 0x4b;
  } catch {
    return false;
  }
}

async function downloadFile(info: FileInfo): Promise<void> {
  try {
    await access(info.localPath, constants.F_OK);
    if (await isValidXlsx(info.localPath)) {
      console.log(`  [cached] ${info.fileName}`);
      return;
    }
    await unlink(info.localPath);
  } catch {}

  console.log(`  [downloading] ${info.fileName}`);
  const res = await fetch(info.url, { method: 'GET', redirect: 'follow', headers: FETCH_HEADERS });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} for ${info.url}`);
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes(XLSX_CONTENT_TYPE)) {
    res.body.cancel();
    throw new Error(`Bad content-type for ${info.url}: ${ct}`);
  }
  const body = Readable.fromWeb(res.body as globalThis.ReadableStream<Uint8Array>);
  await pipeline(body, createWriteStream(info.localPath));
}

async function discoverFiles(): Promise<FileInfo[]> {
  const currentYear = new Date().getFullYear();
  const fyEnd = currentYear + 1;
  const candidates: FileInfo[] = [];

  for (let fy = DEFAULT_FY_START; fy <= fyEnd; fy++) {
    for (let q = 1; q <= 5; q++) {
      const fileName = `LCA_Disclosure_Data_FY${fy}_Q${q}.xlsx`;
      candidates.push({
        fiscalYear: fy,
        quarter: q,
        url: `${DOL_BASE_URL}/${fileName}`,
        fileName,
        localPath: join(DOWNLOAD_DIR, fileName),
      });
    }
  }

  // Probe in parallel to find which files exist
  console.log('Discovering available DOL files...');
  const results = await Promise.all(
    candidates.map(async (c) => {
      try {
        const res = await fetch(c.url, { method: 'GET', redirect: 'follow', headers: FETCH_HEADERS });
        const ct = res.headers.get('content-type') ?? '';
        res.body?.cancel();
        if (res.status === 200 && ct.includes(XLSX_CONTENT_TYPE)) return c;
      } catch {}
      return null;
    })
  );

  return results.filter((r): r is FileInfo => r !== null);
}

// --- Parallel runner with concurrency limit ---

async function runParallel<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

// --- Scan a single XLSX for H-1B1 Singapore employer names ---

interface ScanResult {
  fileName: string;
  normToRaw: Map<string, Set<string>>;
  normToCount: Map<string, number>;
  elapsed: number;
}

async function scanFile(info: FileInfo): Promise<ScanResult> {
  const start = Date.now();
  const normToRaw = new Map<string, Set<string>>();
  const normToCount = new Map<string, number>();

  const stream = await getXlsxStream({ filePath: info.localPath, sheet: 0, withHeader: true });

  await new Promise<void>((resolve, reject) => {
    stream.on('data', (row: any) => {
      const visa = row.formatted?.obj?.VISA_CLASS ?? row.raw?.obj?.VISA_CLASS;
      if (!visa || String(visa) !== 'H-1B1 Singapore') return;

      const name = row.formatted?.obj?.EMPLOYER_NAME ?? row.raw?.obj?.EMPLOYER_NAME;
      if (!name) return;
      const raw = String(name);
      const norm = normalizeEmployerName(raw);
      normToCount.set(norm, (normToCount.get(norm) ?? 0) + 1);
      if (!normToRaw.has(norm)) normToRaw.set(norm, new Set());
      normToRaw.get(norm)!.add(raw);
    });
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  const elapsed = (Date.now() - start) / 1000;
  console.log(`  ${info.fileName}: ${normToRaw.size} unique employers (${elapsed.toFixed(1)}s)`);
  return { fileName: info.fileName, normToRaw, normToCount, elapsed };
}

// --- Pick a suggested name from raw variations ---

function pickSuggestedName(rawVariations: Set<string>): string {
  const trimmed = [...rawVariations].map(r => r.trim());
  // Prefer mixed case (not ALL CAPS, not all lowercase)
  return trimmed.find(r => r !== r.toUpperCase() && r !== r.toLowerCase()) ?? trimmed[0];
}

// --- Main ---

async function main() {
  await mkdir(DOWNLOAD_DIR, { recursive: true });
  console.log(`Download directory: ${DOWNLOAD_DIR}\n`);

  // 1. Discover available files
  const files = await discoverFiles();
  console.log(`\nFound ${files.length} DOL files.\n`);

  // 2. Download in parallel
  console.log('Downloading files...');
  await runParallel(files, DOWNLOAD_CONCURRENCY, downloadFile);
  console.log(`\nAll ${files.length} files downloaded.\n`);

  // 3. Scan in parallel for H-1B1 Singapore employer names
  console.log('Scanning files for H-1B1 Singapore employer names...');
  const scanResults = await runParallel(files, SCAN_CONCURRENCY, scanFile);

  for (const r of scanResults) {
    console.log(`  ${r.fileName}: ${r.normToRaw.size} unique employers (${r.elapsed.toFixed(1)}s)`);
  }

  // 4. Merge results across all files
  const globalNormToRaw = new Map<string, Set<string>>();
  const globalNormToCount = new Map<string, number>();

  for (const r of scanResults) {
    for (const [norm, rawSet] of r.normToRaw) {
      if (!globalNormToRaw.has(norm)) globalNormToRaw.set(norm, new Set());
      for (const raw of rawSet) globalNormToRaw.get(norm)!.add(raw);
      globalNormToCount.set(norm, (globalNormToCount.get(norm) ?? 0) + (r.normToCount.get(norm) ?? 0));
    }
  }

  console.log(`\nTotal unique normalized employer names: ${globalNormToRaw.size}`);

  // 5. Load existing mappings and merge
  const existingMappings: Record<string, string[]> = JSON.parse(await readFile(MAPPINGS_PATH, 'utf-8'));
  const existingVariationToCanonical = new Map<string, string>();
  for (const [canonical, variations] of Object.entries(existingMappings)) {
    for (const v of variations) {
      existingVariationToCanonical.set(v, canonical);
    }
  }

  const newMappings: Record<string, string[]> = { ...existingMappings };
  let addedCount = 0;
  let existingCount = 0;
  const multiVariationGroups: { suggested: string; variations: string[]; count: number }[] = [];

  for (const [norm, rawSet] of globalNormToRaw) {
    if (existingVariationToCanonical.has(norm)) {
      existingCount++;
      continue;
    }

    const suggested = pickSuggestedName(rawSet);
    const count = globalNormToCount.get(norm) ?? 0;

    if (newMappings[suggested]) {
      if (!newMappings[suggested].includes(norm)) {
        newMappings[suggested].push(norm);
      }
    } else {
      newMappings[suggested] = [norm];
    }
    addedCount++;

    // Track groups with multiple raw variations for review
    if (rawSet.size > 1) {
      multiVariationGroups.push({ suggested, variations: [...rawSet], count });
    }
  }

  // Sort by key
  const sorted: Record<string, string[]> = {};
  for (const key of Object.keys(newMappings).sort()) {
    sorted[key] = newMappings[key];
  }

  await writeFile(MAPPINGS_PATH, JSON.stringify(sorted, null, 2) + '\n');

  console.log(`\n=== RESULTS ===`);
  console.log(`Already mapped: ${existingCount}`);
  console.log(`Newly added: ${addedCount}`);
  console.log(`Total mappings: ${Object.keys(sorted).length}`);

  if (multiVariationGroups.length > 0) {
    multiVariationGroups.sort((a, b) => b.count - a.count);
    console.log(`\n=== GROUPS WITH MULTIPLE VARIATIONS (review these) ===\n`);
    for (const { suggested, variations, count } of multiVariationGroups) {
      console.log(`  "${suggested}" — ${count} disclosures, ${variations.length} variations:`);
      for (const v of variations) {
        console.log(`     "${v}"`);
      }
    }
  }

  console.log(`\nDone. Review changes to ${MAPPINGS_PATH} and commit.`);
}

main().catch(console.error);
