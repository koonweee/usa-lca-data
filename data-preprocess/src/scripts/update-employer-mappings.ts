#!/usr/bin/env tsx
/**
 * Scan cached DOL XLSX files for H-1B1 Singapore employer names
 * and update employer-name-mappings.json with suggested names.
 *
 * Prerequisites: run `npm run seed:run` first to download the XLSX files.
 * By default, the seed runner caches them in /tmp/lca-seed.
 *
 * Usage:
 *   npx tsx src/scripts/update-employer-mappings.ts [download-dir]
 *
 * Example:
 *   npx tsx src/scripts/update-employer-mappings.ts /tmp/lca-seed
 */
import { readFile, writeFile } from 'fs/promises';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { getXlsxStream } from 'xlstream';
import { normalizeEmployerName } from '../employer-normalize';

const SCRIPT_DIR = typeof __dirname !== 'undefined' ? __dirname : dirname(new URL(import.meta.url).pathname);
const MAPPINGS_PATH = join(SCRIPT_DIR, '..', 'employer-name-mappings.json');
const DEFAULT_DOWNLOAD_DIR = '/tmp/lca-seed';

// --- Scan a single XLSX for H-1B1 Singapore employer names ---

interface ScanResult {
  fileName: string;
  normToRaw: Map<string, Set<string>>;
  normToCount: Map<string, number>;
  elapsed: number;
}

async function scanFile(filePath: string): Promise<ScanResult> {
  const fileName = filePath.split('/').pop()!;
  const start = Date.now();
  const normToRaw = new Map<string, Set<string>>();
  const normToCount = new Map<string, number>();

  const stream = await getXlsxStream({ filePath, sheet: 0, withHeader: true });

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
  console.log(`  ${fileName}: ${normToRaw.size} unique employers (${elapsed.toFixed(1)}s)`);
  return { fileName, normToRaw, normToCount, elapsed };
}

// --- Pick a suggested name from raw variations ---

function pickSuggestedName(rawVariations: Set<string>): string {
  const trimmed = [...rawVariations].map(r => r.trim());
  // Prefer mixed case (not ALL CAPS, not all lowercase)
  return trimmed.find(r => r !== r.toUpperCase() && r !== r.toLowerCase()) ?? trimmed[0];
}

// --- Main ---

async function main() {
  const downloadDir = process.argv[2] ?? DEFAULT_DOWNLOAD_DIR;

  let files: string[];
  try {
    files = readdirSync(downloadDir)
      .filter(f => f.endsWith('.xlsx'))
      .sort()
      .map(f => join(downloadDir, f));
  } catch {
    console.error(`Could not read directory: ${downloadDir}`);
    console.error('Run "npm run seed:run" first to download the XLSX files.');
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No XLSX files found in ${downloadDir}`);
    console.error('Run "npm run seed:run" first to download the XLSX files.');
    process.exit(1);
  }

  console.log(`Found ${files.length} XLSX files in ${downloadDir}\n`);

  // Scan files sequentially
  console.log('Scanning for H-1B1 Singapore employer names...');
  const scanResults: ScanResult[] = [];
  for (const file of files) {
    scanResults.push(await scanFile(file));
  }

  // Merge results across all files
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

  // Load existing mappings and merge
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
