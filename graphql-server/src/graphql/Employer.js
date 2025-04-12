"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerQuery = exports.PaginatedEmployerType = exports.EmployerType = void 0;
const nexus_1 = require("nexus");
const nexus_prisma_1 = require("nexus-prisma");
const LCADisclosure_1 = require("./LCADisclosure");
exports.EmployerType = (0, nexus_1.objectType)({
    name: nexus_prisma_1.Employer.$name,
    description: nexus_prisma_1.Employer.$description,
    definition(t) {
        t.field(nexus_prisma_1.Employer.city);
        t.field(nexus_prisma_1.Employer.naicsCode);
        t.field(nexus_prisma_1.Employer.name);
        t.field(nexus_prisma_1.Employer.postalCode);
        t.field(nexus_prisma_1.Employer.state);
        t.field(nexus_prisma_1.Employer.uuid);
    },
});
exports.PaginatedEmployerType = (0, nexus_1.objectType)({
    name: "PaginatedEmployer",
    definition(t) {
        t.nonNull.list.nonNull.field("items", { type: "Employer" });
        t.nonNull.boolean("hasNext");
    },
});
exports.employerQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.field("employers", {
            type: "PaginatedEmployer",
            args: {
                searchStr: (0, nexus_1.stringArg)(),
                /** Case status options */
                caseStatuses: (0, nexus_1.list)((0, nexus_1.nonNull)((0, nexus_1.arg)({ type: LCADisclosure_1.caseStatusType }))),
                /** Visa class options */
                visaClasses: (0, nexus_1.list)((0, nexus_1.nonNull)((0, nexus_1.arg)({ type: LCADisclosure_1.visaClassType }))),
                /** Pagination options */
                skip: (0, nexus_1.intArg)({ description: "Number of records to skip", default: 0 }),
                take: (0, nexus_1.intArg)({
                    description: "Number of records to take (max 500)",
                    default: 50,
                }),
            },
            resolve(parent, args, context, info) {
                var _a;
                const { searchStr, visaClasses, caseStatuses, skip, take } = args;
                const where = {};
                if (searchStr) {
                    where.name = { search: searchStr };
                }
                if (visaClasses) {
                    // Find all employers with at least one LCA disclosure with a visa class in the list
                    where.lcaDisclosures = {
                        some: {
                            visaClass: {
                                in: visaClasses,
                            },
                        },
                    };
                }
                if (caseStatuses) {
                    // Find all employers with at least one LCA disclosure with a case status in the list
                    where.lcaDisclosures = {
                        some: Object.assign(Object.assign({}, (_a = where.lcaDisclosures) === null || _a === void 0 ? void 0 : _a.some), { caseStatus: {
                                in: caseStatuses,
                            } }),
                    };
                }
                return context.prisma.employer
                    .findMany({
                    where,
                    skip: skip !== null && skip !== void 0 ? skip : undefined,
                    take: take ? take + 1 : undefined,
                    orderBy: {
                        name: "asc",
                    },
                })
                    .then((result) => {
                    return {
                        items: result.slice(0, take !== null && take !== void 0 ? take : undefined),
                        hasNext: !take || result.length > take,
                    };
                });
            },
        });
    },
});
