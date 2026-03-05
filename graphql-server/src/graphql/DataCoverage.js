"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataCoverageQuery = exports.DataCoverageType = exports.FiscalQuarterType = void 0;
const client_1 = require("@prisma/client");
const nexus_1 = require("nexus");
exports.FiscalQuarterType = (0, nexus_1.objectType)({
    name: 'FiscalQuarter',
    definition(t) {
        t.nonNull.int('fiscalYear');
        t.nonNull.int('quarter');
        t.nonNull.string('label');
    },
});
exports.DataCoverageType = (0, nexus_1.objectType)({
    name: 'DataCoverage',
    definition(t) {
        t.field('start', { type: 'FiscalQuarter' });
        t.field('end', { type: 'FiscalQuarter' });
        t.nonNull.int('seededQuarterCount');
        t.field('lastSeededAt', { type: 'DateTime' });
    },
});
exports.dataCoverageQuery = (0, nexus_1.extendType)({
    type: 'Query',
    definition(t) {
        t.nonNull.field('dataCoverage', {
            type: 'DataCoverage',
            resolve: async (_parent, _args, context) => {
                const where = { status: client_1.$Enums.SeedQuarterStatus.INGESTED };
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
                const toQuarter = (value) => {
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
