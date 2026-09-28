import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '../../../graphql-server/node_modules/@prisma/client';
import mappings from '../employer-name-mappings.json';
import { employerMatchingKey, resolveEmployerName } from '../employer-normalize';
import { DataTransformer } from '../transform';
import { DataLoader } from '../load';

// Opt-in PostgreSQL test. Every run owns a fresh schema, never existing application tables.
const testUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!testUrl)('employer migration and ingestion (PostgreSQL)', () => {
  const schema = `employer_test_${randomUUID().replace(/-/g, '')}`;
  const root = path.resolve(__dirname, '../../..');
  let admin: PrismaClient;
  let db: PrismaClient;
  let loader: DataLoader;
  const oldDatabaseUrl = process.env.DATABASE_URL;
  const ids = Array.from({ length: 7 }, () => randomUUID());
  const legacy = [
    ['Google , LLC', '94043'], ['GOOGLE LLC.', '94043'], ['Google LLC', '10001'],
    ['New Example LLC', '12345'], ['NEW EXAMPLE LLC.', '12345'],
    ['Boston Consulting Group, Inc.', '02110'], ['The Boston Consulting Group, Inc.', '02110'],
  ];
  const snapshotNames = [...new Set(Object.entries(mappings).flatMap(([name, aliases]) => [name, ...aliases]))];
  const sqlString = (value: string) => `'${value.replace(/'/g, "''")}'`;

  beforeAll(async () => {
    const url = new URL(testUrl!);
    url.searchParams.set('schema', schema);
    process.env.DATABASE_URL = url.toString();
    admin = new PrismaClient({ datasources: { db: { url: testUrl! } } });
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    const executeFile = (file: string) => execFileSync(process.execPath, [
      path.join(root, 'graphql-server/node_modules/prisma/build/index.js'),
      'db', 'execute', '--stdin', '--url', url.toString(),
    ], {
      input: `SET search_path TO "${schema}";\n${readFileSync(path.join(root, file), 'utf8')}`,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    executeFile('graphql-server/prisma/migrations/20260305000000_init/migration.sql');
    for (let i = 0; i < legacy.length; i++) {
      await db.$executeRaw`INSERT INTO "Employer" (uuid, name, "postalCode", "naicsCode", city)
        VALUES (${ids[i]}::uuid, ${legacy[i][0]}, ${legacy[i][1]}, '123', 'Test City')`;
    }
    // Compare the frozen SQL snapshot with the actual TypeScript resolver for every alias.
    await db.$executeRawUnsafe(`INSERT INTO "Employer" (uuid, name, "postalCode", "naicsCode", city) VALUES ${
      snapshotNames.map(name => `(gen_random_uuid(), ${sqlString(name)}, 'snapshot', '123', 'Test City')`).join(',')
    }`);
    await db.$executeRaw`INSERT INTO "SOCJob" (code, title) VALUES ('15-1252', 'Software Developer')`;
    for (let i = 0; i < ids.length; i++) {
      await db.$executeRaw`INSERT INTO "LCADisclosure" ("caseNumber", "socCode", "fullTimePosition", "receivedDate", "decisionDate", "beginDate", "employerUuid", "caseStatus", "visaClass")
        VALUES (${`legacy-${i}`}, '15-1252', true, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, ${ids[i]}::uuid, 'Certified', 'H-1B1 Singapore')`;
      await db.$executeRaw`INSERT INTO "RawDisclosureData" ("caseNumber", "employerUuid") VALUES (${`legacy-${i}`}, ${ids[i]}::uuid)`;
    }
    await db.$executeRaw`INSERT INTO "ResumeSubmission" (name, email, "linkedinUrl") VALUES ('Keep Me', 'keep@example.test', 'https://example.test/profile')`;
    await db.$executeRaw`INSERT INTO "SeededQuarter" ("fiscalYear", quarter, "sourceUrl", "lastSeededAt", "lastRunId", status) VALUES (2026, 1, 'https://example.test/data', CURRENT_TIMESTAMP, 'existing-run', 'INGESTED')`;
    executeFile('graphql-server/prisma/migrations/20260928000000_normalize_employers/migration.sql');
    loader = new DataLoader();
    await loader.connect();
  }, 60000);

  afterAll(async () => {
    await loader?.disconnect();
    await db?.$disconnect();
    if (admin) {
      await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.$disconnect();
    }
    if (oldDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = oldDatabaseUrl;
  });

  it('merges old duplicates, preserves postal codes, and reconnects every application', async () => {
    const employers = await db.employer.findMany({ where: { postalCode: { not: 'snapshot' } } });
    expect(employers).toHaveLength(4);
    const cases = await db.lCADisclosure.findMany({ include: { employer: true } });
    expect(cases).toHaveLength(7);
    for (let i = 0; i < legacy.length; i++) {
      const record = cases.find(row => row.caseNumber === `legacy-${i}`)!;
      expect(record.employer.normalizedName).toBe(employerMatchingKey(legacy[i][0]));
      expect(record.employer.postalCode).toBe(legacy[i][1]);
      const raw = await db.rawDisclosureData.findUniqueOrThrow({ where: { caseNumber: record.caseNumber } });
      expect(raw.employerUuid).toBe(record.employerUuid);
    }
    expect(await db.resumeSubmission.findMany()).toMatchObject([{ name: 'Keep Me', email: 'keep@example.test' }]);
    expect(await db.seededQuarter.count()).toBe(1);
  });

  it('uses the same keys and preferred names as TypeScript for the full mapping snapshot', async () => {
    const actual = await db.employer.findMany({ where: { postalCode: 'snapshot' } });
    const expected = new Map(snapshotNames.map(name => [employerMatchingKey(name), resolveEmployerName(name)]));
    expect(actual).toHaveLength(expected.size);
    for (const row of actual) expect(row.name).toBe(expected.get(row.normalizedName));
  });

  it('enforces matching key plus postal code in the database', async () => {
    await expect(db.employer.create({ data: {
      name: 'Another display name', normalizedName: 'google llc', postalCode: '94043', naicsCode: '123', city: 'Test',
    } })).rejects.toMatchObject({ code: 'P2002' });
  });

  it('deduplicates new employers within and across batches while preserving readable names', async () => {
    const transform = new DataTransformer();
    const input = (name: string, caseNumber: string, postalCode = '54321') => ({
      CASE_NUMBER: caseNumber, CASE_STATUS: 'Certified', VISA_CLASS: 'H-1B1 Singapore',
      RECEIVED_DATE: '2026-01-01', DECISION_DATE: '2026-01-02', BEGIN_DATE: '2026-02-01',
      SOC_CODE: '15-1252', SOC_TITLE: 'Software Developer', EMPLOYER_NAME: name,
      EMPLOYER_CITY: 'Test', EMPLOYER_POSTAL_CODE: postalCode, EMPLOYER_ADDRESS1: 'Test',
      EMPLOYER_COUNTRY: 'UNITED STATES OF AMERICA', NAICS_CODE: '123',
    });
    const first = await loader.addLCADisclosures(await transform.transformData([
      input('Future Example LLC', 'new-1'), input('FUTURE EXAMPLE , LLC.', 'new-2'),
    ]));
    expect(first.createdEmployers).toBe(1);
    expect(first.createdLCADisclosures).toBe(2);
    const second = await loader.addLCADisclosures(await transform.transformData([
      input('future example llc.', 'new-3'), input('Future Example LLC', 'new-4', '99999'),
      input('Google Technology Company', 'new-5', '94043'),
    ]));
    expect(second.createdEmployers).toBe(1);
    expect(second.createdLCADisclosures).toBe(3);
    const cases = await db.lCADisclosure.findMany({ where: { caseNumber: { in: ['new-1', 'new-2', 'new-3'] } }, include: { employer: true } });
    expect(new Set(cases.map(row => row.employerUuid)).size).toBe(1);
    expect(cases.every(row => row.employer.name === 'Future Example LLC')).toBe(true);
  });
});
