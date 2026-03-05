import { $Enums } from '@prisma/client';
import { extendType, objectType } from 'nexus';

export const FiscalQuarterType = objectType({
  name: 'FiscalQuarter',
  definition(t) {
    t.nonNull.int('fiscalYear');
    t.nonNull.int('quarter');
    t.nonNull.string('label');
  },
});

export const DataCoverageType = objectType({
  name: 'DataCoverage',
  definition(t) {
    t.field('start', { type: 'FiscalQuarter' });
    t.field('end', { type: 'FiscalQuarter' });
    t.nonNull.int('seededQuarterCount');
    t.field('lastSeededAt', { type: 'DateTime' });
  },
});

export const dataCoverageQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('dataCoverage', {
      type: 'DataCoverage',
      resolve: async (_parent, _args, context) => {
        const where = { status: $Enums.SeedQuarterStatus.INGESTED } as const;

        const [start, end, seededQuarterCount, aggregate] = await Promise.all([
          context.prisma.seededQuarter.findFirst({
            where,
            select: { fiscalYear: true, quarter: true },
            orderBy: [{ fiscalYear: 'asc' }, { quarter: 'asc' }],
          }),
          context.prisma.seededQuarter.findFirst({
            where,
            select: { fiscalYear: true, quarter: true },
            orderBy: [{ fiscalYear: 'desc' }, { quarter: 'desc' }],
          }),
          context.prisma.seededQuarter.count({ where }),
          context.prisma.seededQuarter.aggregate({
            where,
            _max: { lastSeededAt: true },
          }),
        ]);

        const toQuarter = (value: { fiscalYear: number; quarter: number } | null) => {
          if (!value) {
            return null;
          }

          return {
            ...value,
            label: `FY${value.fiscalYear} Q${value.quarter}`,
          };
        };

        return {
          start: toQuarter(start),
          end: toQuarter(end),
          seededQuarterCount,
          lastSeededAt: aggregate._max.lastSeededAt,
        };
      },
    });
  },
});
