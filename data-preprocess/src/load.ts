import { PrismaClient, $Enums, SeedRun, SeedRunQuarter, SeededQuarter } from '../../graphql-server/node_modules/@prisma/client';
import { Prisma } from '../../graphql-server/node_modules/@prisma/client';
import { PrismaCreateInputs } from './types';

export interface AddLCADisclosuresResult {
  totalInputCount: number;
  h1b1InputCount: number;
  createdEmployers: number;
  createdSocJobs: number;
  createdLCADisclosures: number;
}

export interface StartSeedRunInput {
  mode: $Enums.SeedMode;
  fyStart?: number;
  fyEnd?: number;
}

export interface SeedRunSummary {
  discoveredCount: number;
  ingestedCount: number;
  skippedCount: number;
  failedCount: number;
  errorSummary?: string;
}

export interface SeedRunQuarterInput {
  seedRunId: string;
  fiscalYear: number;
  quarter: number;
  sourceUrl: string;
  fileName: string;
  status: $Enums.SeedQuarterStatus;
  recordCount?: number;
  ingestedCount?: number;
  error?: string;
  ingestedAt?: Date;
}

export class DataLoader {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('Connected to database');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('Disconnected from database');
  }

  async addLCADisclosures(inputs: PrismaCreateInputs[]): Promise<AddLCADisclosuresResult> {
    /** Filter to only include H-1B1 */
    const h1b1Only = inputs.filter((input) => input.lcaDisclosure.visaClass === $Enums.visaclass.H_1B1_Singapore);
    console.log(`Filtered from ${inputs.length} total records to ${h1b1Only.length} H-1B1 records`);

    /** Aggregate employer and socJob creates, since LCADisclosure depends on them */
    const employerCreates: Prisma.EmployerCreateInput[] = [];
    const socJobCreates: Prisma.SOCJobCreateInput[] = [];
    h1b1Only.forEach((entry) => {
      employerCreates.push(entry.employer);
      socJobCreates.push(entry.socJob);
    });

    const [createdEmployers, createdSocJobs] = await Promise.all([
      this.prisma.employer.createMany({
        data: employerCreates,
        skipDuplicates: true,
      }),
      this.prisma.sOCJob.createMany({
        data: socJobCreates,
        skipDuplicates: true,
      }),
    ]);

    console.log(`Employers: ${createdEmployers.count}/${employerCreates.length} created`);
    console.log(`SOC Jobs: ${createdSocJobs.count}/${socJobCreates.length} created`);

    // For each LCADisclosure, we need to find the actual employer and soc job entity. Fetch all employer and soc job to create map.
    const allEmployers = await this.prisma.employer.findMany();
    const employerUuidMap = new Map<string, string>();

    allEmployers.forEach((employer) => employerUuidMap.set(`${employer.name}-${employer.postalCode}`, employer.uuid));

    const lcaDisclosuresWithForeignKeys: Prisma.LCADisclosureCreateManyInput[] = h1b1Only.map((input) => {
      const employerUuid = employerUuidMap.get(`${input.employer.name}-${input.employer.postalCode}`);
      if (!employerUuid) {
        throw new Error(`Could not find employer uuid for employer ${JSON.stringify(input.employer, null, 2)}`);
      }

      return {
        ...input.lcaDisclosure,
        employerUuid,
        socCode: input.socJob.code,
      };
    });

    const createdLCADisclosures = await this.prisma.lCADisclosure.createMany({
      data: lcaDisclosuresWithForeignKeys,
      skipDuplicates: true,
    });

    console.log(`LCA Disclosures: ${createdLCADisclosures.count}/${lcaDisclosuresWithForeignKeys.length} created`);

    return {
      totalInputCount: inputs.length,
      h1b1InputCount: h1b1Only.length,
      createdEmployers: createdEmployers.count,
      createdSocJobs: createdSocJobs.count,
      createdLCADisclosures: createdLCADisclosures.count,
    };
  }

  async startSeedRun(input: StartSeedRunInput): Promise<SeedRun> {
    return this.prisma.seedRun.create({
      data: {
        mode: input.mode,
        status: $Enums.SeedRunStatus.RUNNING,
        fyStart: input.fyStart,
        fyEnd: input.fyEnd,
      },
    });
  }

  async finalizeSeedRun(seedRunId: string, summary: SeedRunSummary): Promise<SeedRun> {
    const { discoveredCount, ingestedCount, skippedCount, failedCount, errorSummary } = summary;
    const status = failedCount === 0 ? $Enums.SeedRunStatus.SUCCESS : (ingestedCount > 0 || skippedCount > 0 ? $Enums.SeedRunStatus.PARTIAL : $Enums.SeedRunStatus.FAILED);

    return this.prisma.seedRun.update({
      where: { id: seedRunId },
      data: {
        finishedAt: new Date(),
        status,
        discoveredCount,
        ingestedCount,
        skippedCount,
        failedCount,
        errorSummary,
      },
    });
  }

  async createSeedRunQuarter(input: SeedRunQuarterInput): Promise<SeedRunQuarter> {
    return this.prisma.seedRunQuarter.create({
      data: {
        seedRunId: input.seedRunId,
        fiscalYear: input.fiscalYear,
        quarter: input.quarter,
        sourceUrl: input.sourceUrl,
        fileName: input.fileName,
        status: input.status,
        recordCount: input.recordCount ?? 0,
        ingestedCount: input.ingestedCount ?? 0,
        error: input.error,
        ingestedAt: input.ingestedAt,
      },
    });
  }

  async isQuarterSeeded(fiscalYear: number, quarter: number): Promise<boolean> {
    const seeded = await this.prisma.seededQuarter.findUnique({
      where: {
        fiscalYear_quarter: {
          fiscalYear,
          quarter,
        },
      },
    });

    return seeded?.status === $Enums.SeedQuarterStatus.INGESTED;
  }

  async upsertSeededQuarter(input: {
    fiscalYear: number;
    quarter: number;
    sourceUrl: string;
    lastRunId: string;
    status: $Enums.SeedQuarterStatus;
    recordCount: number;
    ingestedCount: number;
  }): Promise<SeededQuarter> {
    const now = new Date();

    return this.prisma.seededQuarter.upsert({
      where: {
        fiscalYear_quarter: {
          fiscalYear: input.fiscalYear,
          quarter: input.quarter,
        },
      },
      update: {
        sourceUrl: input.sourceUrl,
        lastRunId: input.lastRunId,
        status: input.status,
        recordCount: input.recordCount,
        ingestedCount: input.ingestedCount,
        lastSeededAt: now,
      },
      create: {
        fiscalYear: input.fiscalYear,
        quarter: input.quarter,
        sourceUrl: input.sourceUrl,
        lastRunId: input.lastRunId,
        status: input.status,
        recordCount: input.recordCount,
        ingestedCount: input.ingestedCount,
        lastSeededAt: now,
      },
    });
  }

  async getLatestSeedRun(): Promise<(SeedRun & { quarters: SeedRunQuarter[] }) | null> {
    return this.prisma.seedRun.findFirst({
      orderBy: { startedAt: 'desc' },
      include: {
        quarters: {
          orderBy: [{ fiscalYear: 'asc' }, { quarter: 'asc' }],
        },
      },
    });
  }

  async getCoverage(): Promise<{
    start: Pick<SeededQuarter, 'fiscalYear' | 'quarter'> | null;
    end: Pick<SeededQuarter, 'fiscalYear' | 'quarter'> | null;
    seededQuarterCount: number;
    lastSeededAt: Date | null;
  }> {
    const where = { status: $Enums.SeedQuarterStatus.INGESTED } as const;

    const [start, end, seededQuarterCount, aggregate] = await Promise.all([
      this.prisma.seededQuarter.findFirst({
        where,
        select: { fiscalYear: true, quarter: true },
        orderBy: [{ fiscalYear: 'asc' }, { quarter: 'asc' }],
      }),
      this.prisma.seededQuarter.findFirst({
        where,
        select: { fiscalYear: true, quarter: true },
        orderBy: [{ fiscalYear: 'desc' }, { quarter: 'desc' }],
      }),
      this.prisma.seededQuarter.count({ where }),
      this.prisma.seededQuarter.aggregate({
        where,
        _max: { lastSeededAt: true },
      }),
    ]);

    return {
      start,
      end,
      seededQuarterCount,
      lastSeededAt: aggregate._max.lastSeededAt,
    };
  }

  async clearAllData(): Promise<void> {
    console.warn('WARNING: This will delete all data from the database!');

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.seedRunQuarter.deleteMany();
        await tx.seedRun.deleteMany();
        await tx.seededQuarter.deleteMany();
        await tx.lCADisclosure.deleteMany();
        await tx.resumeSubmission.deleteMany();
        await tx.sOCJob.deleteMany();
        await tx.employer.deleteMany();
        await tx.rawDisclosureData.deleteMany();
      });

      console.log('All data cleared from database');
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw error;
    }
  }
}
