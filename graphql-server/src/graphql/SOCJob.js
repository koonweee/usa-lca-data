"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socJobsQuery = exports.SOCJobType = void 0;
const nexus_1 = require("nexus");
const nexus_prisma_1 = require("nexus-prisma");
exports.SOCJobType = (0, nexus_1.objectType)({
    name: nexus_prisma_1.SOCJob.$name,
    description: nexus_prisma_1.SOCJob.$description,
    definition(t) {
        t.field(nexus_prisma_1.SOCJob.code);
        t.field(nexus_prisma_1.SOCJob.title);
    },
});
const socJobs = [
    {
        code: 'testing0',
        title: 'Testing 0',
    },
    {
        code: 'testing1',
        title: 'Testing 1',
    }
];
exports.socJobsQuery = (0, nexus_1.extendType)({
    type: 'Query',
    definition(t) {
        t.nonNull.list.nonNull.field('socJobs', {
            type: 'SOCJob',
            resolve(parent, args, context, info) {
                return context.prisma.sOCJob.findMany();
            }
        });
    }
});
