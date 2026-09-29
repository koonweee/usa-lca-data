"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerType = void 0;
const nexus_1 = require("nexus");
const nexus_prisma_1 = require("nexus-prisma");
exports.EmployerType = (0, nexus_1.objectType)({
    name: nexus_prisma_1.Employer.$name,
    description: nexus_prisma_1.Employer.$description,
    definition(t) {
        t.field(nexus_prisma_1.Employer.city);
        t.field(nexus_prisma_1.Employer.naicsCode);
        t.field(nexus_prisma_1.Employer.name);
        t.field(nexus_prisma_1.Employer.postalCode);
        t.field(nexus_prisma_1.Employer.postalCodeValid);
        t.field(nexus_prisma_1.Employer.normalizedCity);
        t.field(nexus_prisma_1.Employer.state);
        t.field(nexus_prisma_1.Employer.uuid);
    },
});
