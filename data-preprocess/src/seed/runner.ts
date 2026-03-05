#!/usr/bin/env node
import { createWriteStream } from 'fs';
import { mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { $Enums } from '../../../graphql-server/node_modules/@prisma/client';
import { Extract } from '../extract';
import { DataLoader } from '../load';
import { DataTransformer } from '../transform';

const DOL_BASE_URL = 'https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs';
const DEFAULT_FY_START = 2018;
const DEFAULT_FY_END_OFFSET = 1;
const DEFAULT_DOWNLOAD_DIR = '/tmp/lca-seed';

interface SeedCandidate {
  fiscalYear: number;
  quarter: number;
  sourceUrl: string;
  fileName: string;
}

interface CliOptions {
  fyStart: number;
  fyEnd: number;
  force: Set<string>;
  downloadDir: string;
}

function getDefaultFyEnd(): number {
  return new Date().getUTCFullYear() + DEFAULT_FY_END_OFFSET;
}

function getQuarterKey(fiscalYear: number, quarter: number): string {
  return `FY${fiscalYear}Q${quarter}`;
}

function isForced(forceSet: Set<string>, fiscalYear: number, quarter: number): boolean {
  return forceSet.has(getQuarterKey(fiscalYear, quarter));
}

function parseQuarterList(raw: string): Set<string> {
  const result = new Set<string>();
  if (!raw.trim()) {
    return result;
  }

  for (const token of raw.split(',')) {
    const normalized = token.trim().toUpperCase();
    if (!normalized) {
      continue;
    }

    const match = normalized.match(/^FY(\d{4})Q([1-5])$/);
    if (!match) {
      throw new Error(`Invalid --force token '${token}'. Use FY2026Q1,FY2025Q4 format.`);
    }

    result.add(normalized);
  }

  return result;
}

function parseCliOptions(args: string[]): CliOptions {
  const options: CliOptions = {
    fyStart: DEFAULT_FY_START,
    fyEnd: getDefaultFyEnd(),
    force: new Set<string>(),
    downloadDir: process.env.SEED_DOWNLOAD_DIR || DEFAULT_DOWNLOAD_DIR,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--fy-start') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --fy-start');
      }
      options.fyStart = Number.parseInt(value, 10);
      i += 1;
      continue;
    }

    if (arg.startsWith('--fy-start=')) {
      const value = arg.split('=', 2)[1];
      options.fyStart = Number.parseInt(value, 10);
      continue;
    }

    if (arg === '--fy-end') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --fy-end');
      }
      options.fyEnd = Number.parseInt(value, 10);
      i += 1;
      continue;
    }

    if (arg.startsWith('--fy-end=')) {
      const value = arg.split('=', 2)[1];
      options.fyEnd = Number.parseInt(value, 10);
      continue;
    }

    if (arg === '--force') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --force');
      }
      options.force = parseQuarterList(value);
      i += 1;
      continue;
    }

    if (arg.startsWith('--force=')) {
      const value = arg.split('=', 2)[1];
      options.force = parseQuarterList(value);
      continue;
    }

    if (arg === '--download-dir') {
      const value = args[i + 1];
      if (!value) {
        throw new Error('Missing value for --download-dir');
      }
      options.downloadDir = value;
      i += 1;
      continue;
    }

    if (arg.startsWith('--download-dir=')) {
      const value = arg.split('=', 2)[1];
      options.downloadDir = value;
      continue;
    }

    throw new Error(`Unknown argument '${arg}'`);
  }

  if (!Number.isInteger(options.fyStart) || options.fyStart < 2000) {
    throw new Error(`Invalid --fy-start '${options.fyStart}'`);
  }

  if (!Number.isInteger(options.fyEnd) || options.fyEnd < options.fyStart) {
    throw new Error(`Invalid --fy-end '${options.fyEnd}'`);
  }

  return options;
}

function getDOLUrl(fiscalYear: number, quarter: number): string {
  return `${DOL_BASE_URL}/LCA_Disclosure_Data_FY${fiscalYear}_Q${quarter}.xlsx`;
}

async function urlExists(url: string): Promise<boolean> {
  const response = await fetch(url, { method: 'GET', redirect: 'follow' });
  // Cancel response body stream immediately, we only need status code.
  response.body?.cancel();
  return response.status === 200;
}

async function discoverAvailableQuarters(fyStart: number, fyEnd: number): Promise<SeedCandidate[]> {
  const candidates: SeedCandidate[] = [];

  for (let fiscalYear = fyStart; fiscalYear <= fyEnd; fiscalYear += 1) {
    for (let quarter = 1; quarter <= 5; quarter += 1) {
      const sourceUrl = getDOLUrl(fiscalYear, quarter);

      try {
        const exists = await urlExists(sourceUrl);
        if (!exists) {
          continue;
        }

        candidates.push({
          fiscalYear,
          quarter,
          sourceUrl,
          fileName: `LCA_Disclosure_Data_FY${fiscalYear}_Q${quarter}.xlsx`,
        });
      } catch (error) {
        console.warn(`Failed to probe ${sourceUrl}: ${(error as Error).message}`);
      }
    }
  }

  return candidates;
}

async function ensureFileDownloaded(candidate: SeedCandidate, downloadDir: string): Promise<string> {
  await mkdir(downloadDir, { recursive: true });
  const destination = join(downloadDir, candidate.fileName);

  try {
    await access(destination, constants.F_OK);
    return destination;
  } catch {
    // continue and download
  }

  const response = await fetch(candidate.sourceUrl, { method: 'GET', redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${candidate.sourceUrl}: HTTP ${response.status}`);
  }

  const body = Readable.fromWeb(response.body as globalThis.ReadableStream<Uint8Array>);
  const file = createWriteStream(destination);
  await pipeline(body, file);
  return destination;
}

function printUsage(): void {
  console.log(`
Usage:
  npm run seed:run -- [--fy-start 2018] [--fy-end 2027] [--force FY2026Q1,FY2025Q4] [--download-dir /tmp/lca-seed]
  npm run seed:status
  npm run seed:list-available -- [--fy-start 2018] [--fy-end 2027]
`);
}

function formatQuarterLabel(fiscalYear: number, quarter: number): string {
  return `FY${fiscalYear} Q${quarter}`;
}

async function runListAvailable(args: string[]): Promise<number> {
  const options = parseCliOptions(args);
  const discovered = await discoverAvailableQuarters(options.fyStart, options.fyEnd);

  if (discovered.length === 0) {
    console.log('No DOL FY/Q files found for the selected range.');
    return 0;
  }

  console.log(`Discovered ${discovered.length} DOL files:`);
  discovered.forEach((candidate) => {
    console.log(`- ${formatQuarterLabel(candidate.fiscalYear, candidate.quarter)} ${candidate.sourceUrl}`);
  });

  return 0;
}

async function runStatus(): Promise<number> {
  const loader = new DataLoader();
  await loader.connect();

  try {
    const [latestRun, coverage] = await Promise.all([loader.getLatestSeedRun(), loader.getCoverage()]);

    if (!latestRun) {
      console.log('No seed runs found.');
    } else {
      console.log(`Latest seed run: ${latestRun.id}`);
      console.log(`Status: ${latestRun.status}`);
      console.log(`Mode: ${latestRun.mode}`);
      console.log(`Started: ${latestRun.startedAt.toISOString()}`);
      console.log(`Finished: ${latestRun.finishedAt ? latestRun.finishedAt.toISOString() : 'N/A'}`);
      console.log(`Quarters -> discovered=${latestRun.discoveredCount}, ingested=${latestRun.ingestedCount}, skipped=${latestRun.skippedCount}, failed=${latestRun.failedCount}`);
      if (latestRun.errorSummary) {
        console.log(`Errors: ${latestRun.errorSummary}`);
      }
    }

    if (!coverage.start || !coverage.end) {
      console.log('Coverage: Dataset coverage unavailable (no seeded quarters yet).');
    } else {
      console.log(`Coverage: ${formatQuarterLabel(coverage.start.fiscalYear, coverage.start.quarter)} to ${formatQuarterLabel(coverage.end.fiscalYear, coverage.end.quarter)}`);
      console.log(`Coverage seeded quarters: ${coverage.seededQuarterCount}`);
      console.log(`Coverage last seeded at: ${coverage.lastSeededAt ? coverage.lastSeededAt.toISOString() : 'N/A'}`);
    }

    return 0;
  } finally {
    await loader.disconnect();
  }
}

async function runSeed(args: string[]): Promise<number> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run seeding.');
  }

  const options = parseCliOptions(args);
  const discovered = await discoverAvailableQuarters(options.fyStart, options.fyEnd);

  if (discovered.length === 0) {
    console.log('No DOL files discovered. Nothing to seed.');
    return 0;
  }

  const loader = new DataLoader();
  const transformer = new DataTransformer();

  await loader.connect();

  const mode = options.force.size > 0 ? $Enums.SeedMode.FORCE : $Enums.SeedMode.INCREMENTAL;
  const seedRun = await loader.startSeedRun({
    mode,
    fyStart: options.fyStart,
    fyEnd: options.fyEnd,
  });

  console.log(`Started seed run ${seedRun.id} in ${mode} mode`);

  let ingestedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  try {
    for (const candidate of discovered) {
      const quarterLabel = formatQuarterLabel(candidate.fiscalYear, candidate.quarter);
      const forced = isForced(options.force, candidate.fiscalYear, candidate.quarter);
      const alreadySeeded = forced ? false : await loader.isQuarterSeeded(candidate.fiscalYear, candidate.quarter);

      if (alreadySeeded) {
        skippedCount += 1;
        console.log(`Skipping ${quarterLabel} (already seeded)`);

        await loader.createSeedRunQuarter({
          seedRunId: seedRun.id,
          fiscalYear: candidate.fiscalYear,
          quarter: candidate.quarter,
          sourceUrl: candidate.sourceUrl,
          fileName: candidate.fileName,
          status: $Enums.SeedQuarterStatus.SKIPPED_ALREADY_SEEDED,
        });

        continue;
      }

      try {
        console.log(`Seeding ${quarterLabel}`);
        const downloadedPath = await ensureFileDownloaded(candidate, options.downloadDir);
        const rawData = await Extract.extractData(downloadedPath);
        const transformedData = await transformer.transformData(rawData);
        const loadStats = await loader.addLCADisclosures(transformedData);

        ingestedCount += 1;

        await loader.createSeedRunQuarter({
          seedRunId: seedRun.id,
          fiscalYear: candidate.fiscalYear,
          quarter: candidate.quarter,
          sourceUrl: candidate.sourceUrl,
          fileName: candidate.fileName,
          status: $Enums.SeedQuarterStatus.INGESTED,
          recordCount: rawData.length,
          ingestedCount: loadStats.createdLCADisclosures,
          ingestedAt: new Date(),
        });

        await loader.upsertSeededQuarter({
          fiscalYear: candidate.fiscalYear,
          quarter: candidate.quarter,
          sourceUrl: candidate.sourceUrl,
          lastRunId: seedRun.id,
          status: $Enums.SeedQuarterStatus.INGESTED,
          recordCount: rawData.length,
          ingestedCount: loadStats.createdLCADisclosures,
        });

        console.log(`Completed ${quarterLabel}: extracted=${rawData.length}, inserted=${loadStats.createdLCADisclosures}`);
      } catch (error) {
        failedCount += 1;
        const message = (error as Error).message;
        errors.push(`${quarterLabel}: ${message}`);
        console.error(`Failed ${quarterLabel}: ${message}`);

        await loader.createSeedRunQuarter({
          seedRunId: seedRun.id,
          fiscalYear: candidate.fiscalYear,
          quarter: candidate.quarter,
          sourceUrl: candidate.sourceUrl,
          fileName: candidate.fileName,
          status: $Enums.SeedQuarterStatus.FAILED,
          error: message,
        });

        await loader.upsertSeededQuarter({
          fiscalYear: candidate.fiscalYear,
          quarter: candidate.quarter,
          sourceUrl: candidate.sourceUrl,
          lastRunId: seedRun.id,
          status: $Enums.SeedQuarterStatus.FAILED,
          recordCount: 0,
          ingestedCount: 0,
        });
      }
    }

    await loader.finalizeSeedRun(seedRun.id, {
      discoveredCount: discovered.length,
      ingestedCount,
      skippedCount,
      failedCount,
      errorSummary: errors.length > 0 ? errors.join(' | ') : undefined,
    });

    console.log(`Seed run summary -> discovered=${discovered.length}, ingested=${ingestedCount}, skipped=${skippedCount}, failed=${failedCount}`);

    return failedCount > 0 ? 1 : 0;
  } catch (error) {
    const message = (error as Error).message;
    await loader.finalizeSeedRun(seedRun.id, {
      discoveredCount: discovered.length,
      ingestedCount,
      skippedCount,
      failedCount: failedCount + 1,
      errorSummary: message,
    });

    throw error;
  } finally {
    await loader.disconnect();
  }
}

async function main(): Promise<void> {
  const [, , command = 'run', ...args] = process.argv;

  try {
    let exitCode = 0;

    switch (command) {
      case 'run':
        exitCode = await runSeed(args);
        break;
      case 'status':
        exitCode = await runStatus();
        break;
      case 'list-available':
        exitCode = await runListAvailable(args);
        break;
      case 'help':
      case '--help':
      case '-h':
        printUsage();
        exitCode = 0;
        break;
      default:
        throw new Error(`Unknown command '${command}'`);
    }

    process.exit(exitCode);
  } catch (error) {
    console.error(`Seed runner failed: ${(error as Error).message}`);
    printUsage();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
