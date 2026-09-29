"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCJobType = void 0;
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
