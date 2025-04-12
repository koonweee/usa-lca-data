"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCADisclosureStatsType = exports.lcaDisclosureQuery = exports.PaginatedLCADisclosuresUniqueColumnValuesType = exports.LCADisclosuresType = exports.paginationInput = exports.lcaDisclosureFiltersInput = exports.EmployerAndCountType = exports.UniqueEmployersType = exports.StringValuesAndCountType = exports.UniqueJobTitlesType = exports.caseStatusAndCountType = exports.UniqueCaseStatusesType = exports.VisaClassAndCountType = exports.UniqueVisaClassesType = exports.SortOrder = exports.LCADisclosureOrderByInput = exports.LCADisclosureType = exports.CASE_STATUS_ENUM_TO_READABLE = exports.VISA_CLASS_ENUM_TO_READABLE = exports.visaClassType = exports.caseStatusType = exports.payUnitType = void 0;
const client_1 = require("@prisma/client");
const nexus_1 = require("nexus");
const nexus_prisma_1 = require("nexus-prisma");
exports.payUnitType = (0, nexus_1.enumType)(nexus_prisma_1.payunit);
exports.caseStatusType = (0, nexus_1.enumType)(nexus_prisma_1.casestatus);
exports.visaClassType = (0, nexus_1.enumType)(nexus_prisma_1.visaclass);
exports.VISA_CLASS_ENUM_TO_READABLE = {
    H_1B: "H-1B",
    H_1B1_Chile: "H-1B1 Chile",
    H_1B1_Singapore: "H-1B1 Singapore",
    E_3_Australian: "E-3 Australian",
};
exports.CASE_STATUS_ENUM_TO_READABLE = {
    Certified: "Certified",
    Certified___Withdrawn: "Certified - Withdrawn",
    Denied: "Denied",
    Withdrawn: "Withdrawn",
};
exports.LCADisclosureType = (0, nexus_1.objectType)({
    name: nexus_prisma_1.LCADisclosure.$name,
    description: nexus_prisma_1.LCADisclosure.$description,
    definition(t) {
        t.field(nexus_prisma_1.LCADisclosure.caseNumber);
        t.field(nexus_prisma_1.LCADisclosure.jobTitle);
        t.field(nexus_prisma_1.LCADisclosure.socCode);
        t.field(nexus_prisma_1.LCADisclosure.fullTimePosition);
        t.field(nexus_prisma_1.LCADisclosure.receivedDate);
        t.field(nexus_prisma_1.LCADisclosure.decisionDate);
        t.field(nexus_prisma_1.LCADisclosure.beginDate);
        t.field(nexus_prisma_1.LCADisclosure.worksitePostalCode);
        t.field(nexus_prisma_1.LCADisclosure.wageRateOfPayFrom);
        t.field(nexus_prisma_1.LCADisclosure.wageRateOfPayTo);
        t.field(nexus_prisma_1.LCADisclosure.prevailingWageRateOfPay);
        t.field(nexus_prisma_1.LCADisclosure.worksiteCity);
        t.field(nexus_prisma_1.LCADisclosure.worksiteState);
        t.field(nexus_prisma_1.LCADisclosure.wageRateOfPayUnit);
        t.field(nexus_prisma_1.LCADisclosure.prevailingWageRateOfPayUnit);
        t.field(nexus_prisma_1.LCADisclosure.caseStatus);
        t.field(nexus_prisma_1.LCADisclosure.visaClass);
        t.field(nexus_prisma_1.LCADisclosure.employer);
        t.field(nexus_prisma_1.LCADisclosure.socJob);
    },
});
exports.LCADisclosureOrderByInput = (0, nexus_1.inputObjectType)({
    name: "LCADisclosureOrderByInput",
    definition(t) {
        // t.field("decisionDate", { type: "SortOrder" });
        // t.field("receivedDate", { type: "SortOrder" });
        t.field("beginDate", { type: "SortOrder" });
        t.field("wageRateOfPayFrom", { type: "SortOrder" });
    },
});
exports.SortOrder = (0, nexus_1.enumType)({
    name: "SortOrder",
    members: ["asc", "desc"],
});
exports.UniqueVisaClassesType = (0, nexus_1.objectType)({
    name: "UniqueVisaClasses",
    definition(t) {
        t.nonNull.list.nonNull.field("uniqueValues", { type: "VisaClassAndCount" });
    },
});
exports.VisaClassAndCountType = (0, nexus_1.objectType)({
    name: "VisaClassAndCount",
    definition(t) {
        t.nonNull.field("visaClass", { type: "visaclass" });
        t.nonNull.int("count");
    },
});
exports.UniqueCaseStatusesType = (0, nexus_1.objectType)({
    name: "UniqueCaseStatuses",
    definition(t) {
        t.nonNull.list.nonNull.field("uniqueValues", {
            type: "CaseStatusAndCount",
        });
    },
});
exports.caseStatusAndCountType = (0, nexus_1.objectType)({
    name: "CaseStatusAndCount",
    definition(t) {
        t.nonNull.field("caseStatus", { type: "casestatus" });
        t.nonNull.int("count");
    },
});
exports.UniqueJobTitlesType = (0, nexus_1.objectType)({
    name: "UniqueJobTitles",
    definition(t) {
        t.nonNull.list.nonNull.field("uniqueValues", {
            type: "StringValuesAndCount",
        });
        t.boolean("hasNext");
    },
});
exports.StringValuesAndCountType = (0, nexus_1.objectType)({
    name: "StringValuesAndCount",
    definition(t) {
        t.nonNull.string("value");
        t.nonNull.int("count");
    },
});
exports.UniqueEmployersType = (0, nexus_1.objectType)({
    name: "UniqueEmployers",
    definition(t) {
        t.nonNull.list.nonNull.field("uniqueValues", {
            type: "Employer",
        });
        t.boolean("hasNext");
    },
});
exports.EmployerAndCountType = (0, nexus_1.extendType)({
    type: "Employer",
    definition(t) {
        t.nonNull.int("count");
    },
});
exports.lcaDisclosureFiltersInput = (0, nexus_1.inputObjectType)({
    name: "LCADisclosureFilters",
    definition(t) {
        t.list.nonNull.string("employerUuid");
        t.list.nonNull.field("caseStatus", { type: "casestatus" });
        t.list.nonNull.field("visaClass", { type: "visaclass" });
        t.list.nonNull.string("jobTitle");
    },
});
exports.paginationInput = (0, nexus_1.inputObjectType)({
    name: "PaginationInput",
    definition(t) {
        t.int("skip");
        t.int("take");
    },
});
exports.LCADisclosuresType = (0, nexus_1.objectType)({
    name: "LCADisclosures",
    definition(t) {
        t.nonNull.list.nonNull.field("items", {
            type: "LCADisclosure",
            args: {
                filters: (0, nexus_1.arg)({
                    type: "LCADisclosureFilters",
                    description: "Filter options",
                }),
                pagination: (0, nexus_1.arg)({
                    type: "PaginationInput",
                    description: "Pagination options",
                }),
                sorting: (0, nexus_1.arg)({
                    type: "LCADisclosureOrderByInput",
                    description: "Sorting options",
                }),
            },
            resolve: (parent, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                const { filters, pagination, sorting } = args;
                const { skip, take } = pagination !== null && pagination !== void 0 ? pagination : {};
                const where = constructPrismaWhereFromFilters(filters !== null && filters !== void 0 ? filters : {});
                const { beginDate, wageRateOfPayFrom } = sorting !== null && sorting !== void 0 ? sorting : {};
                const orderBy = [];
                if (beginDate) {
                    orderBy.push({ beginDate });
                }
                if (wageRateOfPayFrom) {
                    orderBy.push({ wageRateOfPayFrom });
                }
                if (Object.keys(orderBy).length === 0) {
                    orderBy.push({ beginDate: "desc" });
                }
                // Always include case number in the order by to ensure consistent ordering
                orderBy.push({ caseNumber: "desc" });
                const disclosureItems = context.prisma.lCADisclosure.findMany({
                    where,
                    skip: skip !== null && skip !== void 0 ? skip : undefined,
                    take: take ? take + 1 : undefined,
                    orderBy,
                });
                return disclosureItems.then((items) => take ? items.slice(0, take) : items);
            }),
        });
        t.nonNull.field("stats", {
            type: exports.LCADisclosureStatsType,
            args: {
                filters: (0, nexus_1.arg)({
                    type: "LCADisclosureFilters",
                    description: "Filter options",
                }),
            },
            resolve: (parent, args, context, info) => __awaiter(this, void 0, void 0, function* () {
                const { filters } = args;
                const where = constructPrismaWhereFromFilters(filters !== null && filters !== void 0 ? filters : {});
                const certifiedWhere = constructPrismaWhereFromFilters(Object.assign(Object.assign({}, filters), { caseStatus: ["Certified"] }));
                const [totalCount, certifiedCount] = yield Promise.all([
                    context.prisma.lCADisclosure.count({ where }),
                    context.prisma.lCADisclosure.count({
                        where: certifiedWhere,
                    }),
                ]);
                const successPercentage = totalCount > 0
                    ? (certifiedCount / totalCount) * 100
                    : 0;
                return {
                    totalCount,
                    successPercentage,
                };
            }),
        });
    },
});
exports.PaginatedLCADisclosuresUniqueColumnValuesType = (0, nexus_1.objectType)({
    name: "PaginatedLCADisclosuresUniqueColumnValues",
    definition(t) {
        t.nonNull.field("visaClasses", {
            type: "UniqueVisaClasses",
            description: "Unique visa classes in the result set for a given filter",
            args: {
                filters: (0, nexus_1.arg)({
                    type: "LCADisclosureFilters",
                    description: "Filter options",
                }),
            },
            resolve: (_parent, args, context, _info) => __awaiter(this, void 0, void 0, function* () {
                const { filters } = args;
                const where = constructPrismaWhereFromFilters(filters !== null && filters !== void 0 ? filters : {});
                const uniqueClassesAndCounts = context.prisma.lCADisclosure
                    .groupBy({
                    where,
                    by: ["visaClass"],
                    _count: { visaClass: true },
                    orderBy: { visaClass: "asc" },
                })
                    .then((result) => {
                    return result.map((r) => ({
                        visaClass: r.visaClass,
                        count: r._count.visaClass,
                    }));
                });
                return { uniqueValues: uniqueClassesAndCounts };
            }),
        });
        t.nonNull.field("caseStatuses", {
            type: "UniqueCaseStatuses",
            description: "Unique case statuses in the result set for a given filter",
            args: {
                filters: (0, nexus_1.arg)({
                    type: "LCADisclosureFilters",
                    description: "Filter options",
                }),
            },
            resolve: (_parent, args, context, _info) => {
                const { filters } = args;
                const where = constructPrismaWhereFromFilters(filters !== null && filters !== void 0 ? filters : {});
                const uniqueStatusesAndCounts = context.prisma.lCADisclosure
                    .groupBy({
                    where,
                    by: ["caseStatus"],
                    _count: { caseStatus: true },
                    orderBy: { caseStatus: "asc" },
                })
                    .then((result) => {
                    return result.map((r) => ({
                        caseStatus: r.caseStatus,
                        count: r._count.caseStatus,
                    }));
                });
                return { uniqueValues: uniqueStatusesAndCounts };
            },
        });
        t.nonNull.field("jobTitles", {
            type: "UniqueJobTitles",
            description: "Unique job titles in the result set for a given filter",
            args: {
                filters: (0, nexus_1.arg)({
                    type: "LCADisclosureFilters",
                    description: "Filter options",
                }),
            },
            resolve: (_parent, args, context, _info) => {
                const { filters } = args;
                const where = constructPrismaWhereFromFilters(filters !== null && filters !== void 0 ? filters : {});
                const uniqueJobTitlesAndCounts = context.prisma.lCADisclosure
                    .groupBy({
                    where,
                    by: ["jobTitle"],
                    _count: { jobTitle: true },
                    orderBy: { jobTitle: "asc" },
                })
                    .then((result) => {
                    return result
                        .filter((r) => r.jobTitle !== null)
                        .map((r) => ({
                        value: r.jobTitle,
                        count: r._count.jobTitle,
                    }));
                });
                return { uniqueValues: uniqueJobTitlesAndCounts };
            },
        });
        t.nonNull.field("employers", {
            type: "UniqueEmployers",
            description: "Unique employers in the result set for a given filter",
            args: {
                filters: (0, nexus_1.arg)({
                    type: "LCADisclosureFilters",
                    description: "Filter options",
                }),
                employerNameSearchStr: (0, nexus_1.stringArg)({
                    description: "Search string for employer name",
                }),
                pagination: (0, nexus_1.arg)({
                    type: "PaginationInput",
                    description: "Pagination options",
                }),
            },
            resolve: (_parent, args, context, _info) => __awaiter(this, void 0, void 0, function* () {
                const { filters, pagination, employerNameSearchStr } = args;
                const { skip, take } = pagination !== null && pagination !== void 0 ? pagination : {};
                const filtersWhereClauses = constructTemplateStringWhereFromFilters(filters !== null && filters !== void 0 ? filters : {});
                const searchStrWhereClase = employerNameSearchStr && employerNameSearchStr.length > 0
                    ? client_1.Prisma.sql `to_tsvector("public"."Employer"."name") @@ phraseto_tsquery(${employerNameSearchStr})`
                    : undefined;
                const whereExists = filtersWhereClauses || searchStrWhereClase;
                const whereTemplate = whereExists
                    ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join([filtersWhereClauses, searchStrWhereClase].filter((clause) => !!clause), "AND ")}`
                    : client_1.Prisma.empty;
                const uniqueEmployersAndCounts = context.prisma.$queryRaw `
          SELECT "public"."Employer".*, count(*) as count
          FROM "public"."LCADisclosure"
          INNER JOIN "public"."Employer" ON "public"."LCADisclosure"."employerUuid" = "public"."Employer"."uuid"
          ${whereTemplate}
          GROUP BY "public"."Employer"."uuid"
          ORDER BY "public"."Employer"."name" ASC
          ${take ? client_1.Prisma.sql `LIMIT ${take + 1}` : client_1.Prisma.empty}
          ${skip ? client_1.Prisma.sql `OFFSET ${skip}` : client_1.Prisma.empty}
        `;
                return uniqueEmployersAndCounts.then((employers) => {
                    // Convert big int to int
                    const employersProcessed = employers.map((employer) => (Object.assign(Object.assign({}, employer), { count: Number(employer.count) })));
                    return {
                        uniqueValues: take
                            ? employersProcessed.slice(0, take)
                            : employersProcessed,
                        hasNext: !take || employersProcessed.length > take,
                    };
                });
            }),
        });
        t.nonNull.field("jobTitles", {
            type: "UniqueJobTitles",
            description: "Unique job titles in the result set for a given filter",
            args: {
                filters: (0, nexus_1.arg)({
                    type: "LCADisclosureFilters",
                    description: "Filter options",
                }),
                jobTitleSearchStr: (0, nexus_1.stringArg)({
                    description: "Search string for job title",
                }),
                pagination: (0, nexus_1.arg)({
                    type: "PaginationInput",
                    description: "Pagination options",
                }),
            },
            resolve: (_parent, args, context, _info) => __awaiter(this, void 0, void 0, function* () {
                const { filters, pagination, jobTitleSearchStr } = args;
                const { skip, take } = pagination !== null && pagination !== void 0 ? pagination : {};
                const filtersWhereClauses = constructTemplateStringWhereFromFilters(filters !== null && filters !== void 0 ? filters : {});
                const searchStrWhereClase = jobTitleSearchStr && jobTitleSearchStr.length > 0
                    ? client_1.Prisma.sql `to_tsvector("public"."LCADisclosure"."jobTitle") @@ phraseto_tsquery(${jobTitleSearchStr})`
                    : undefined;
                const whereExists = filtersWhereClauses || searchStrWhereClase;
                const whereTemplate = whereExists
                    ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join([filtersWhereClauses, searchStrWhereClase].filter((clause) => !!clause), "AND ")}`
                    : client_1.Prisma.empty;
                const uniqueJobTitlesAndCounts = context.prisma.$queryRaw `
          SELECT "public"."LCADisclosure"."jobTitle", count(*) as count
          FROM "public"."LCADisclosure"
          ${whereTemplate}
          GROUP BY "public"."LCADisclosure"."jobTitle"
          ORDER BY count desc, "public"."LCADisclosure"."jobTitle" ASC
          ${take ? client_1.Prisma.sql `LIMIT ${take + 1}` : client_1.Prisma.empty}
          ${skip ? client_1.Prisma.sql `OFFSET ${skip}` : client_1.Prisma.empty}
        `;
                return uniqueJobTitlesAndCounts.then((jobTitles) => {
                    // Convert big int to int
                    const jobTitlesProcessed = jobTitles.map((jobTitle) => ({
                        value: jobTitle.jobTitle,
                        count: Number(jobTitle.count),
                    }));
                    return {
                        uniqueValues: take
                            ? jobTitlesProcessed.slice(0, take)
                            : jobTitlesProcessed,
                        hasNext: !take || jobTitlesProcessed.length > take,
                    };
                });
            }),
        });
    },
});
exports.lcaDisclosureQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.field("lcaDisclosures", {
            type: "LCADisclosures",
            resolve: () => ({}),
        });
        t.nonNull.field("uniqueColumnValues", {
            type: "PaginatedLCADisclosuresUniqueColumnValues",
            resolve: () => ({}),
        });
    },
});
function constructPrismaWhereFromFilters(filters) {
    // Build where clause from filters
    const { employerUuid, caseStatus, jobTitle } = filters !== null && filters !== void 0 ? filters : {};
    const where = {};
    if (caseStatus && caseStatus.length > 0) {
        where.caseStatus = { in: caseStatus };
    }
    // if (visaClass && visaClass.length > 0) {
    //   where.visaClass = { in: visaClass };
    // }
    where.visaClass = { in: ["H_1B1_Singapore"] }; // Hardcoding to only get H-1B1 Singapore
    if (employerUuid && employerUuid.length > 0) {
        where.employerUuid = { in: employerUuid };
    }
    if (jobTitle && jobTitle.length > 0) {
        where.jobTitle = { in: jobTitle };
    }
    return where;
}
function constructTemplateStringWhereFromFilters(filters) {
    const { employerUuid, caseStatus, visaClass, jobTitle } = filters !== null && filters !== void 0 ? filters : {};
    const caseStatusExists = caseStatus && caseStatus.length > 0;
    const visaClassExists = visaClass && visaClass.length > 0;
    const employerUuidExists = employerUuid && employerUuid.length > 0;
    const jobTitleExists = jobTitle && jobTitle.length > 0;
    if (!caseStatusExists &&
        !visaClassExists &&
        !employerUuidExists &&
        !jobTitleExists) {
        return undefined;
    }
    const template = client_1.Prisma.sql `
    ${caseStatusExists
        ? client_1.Prisma.sql `"caseStatus" IN (${client_1.Prisma.join(caseStatus.map((status) => client_1.Prisma.sql `CAST(${exports.CASE_STATUS_ENUM_TO_READABLE[status]}::text as "public"."casestatus")`))})`
        : client_1.Prisma.empty}
    ${caseStatusExists && visaClassExists ? client_1.Prisma.sql `AND` : client_1.Prisma.empty}
    ${visaClassExists
        ? client_1.Prisma.sql `"visaClass" IN (${client_1.Prisma.join(visaClass.map((visa) => client_1.Prisma.sql `CAST(${exports.VISA_CLASS_ENUM_TO_READABLE[visa]}::text as "public"."visaclass")`))})`
        : client_1.Prisma.empty}
    ${(caseStatusExists || visaClassExists) && employerUuidExists
        ? client_1.Prisma.sql `AND`
        : client_1.Prisma.empty}
    ${employerUuidExists
        ? client_1.Prisma.sql `"employerUuid" IN (${client_1.Prisma.join(employerUuid.map((uuid) => client_1.Prisma.sql `${uuid}::uuid`))})`
        : client_1.Prisma.empty}
    ${(caseStatusExists || visaClassExists || employerUuidExists) &&
        jobTitleExists
        ? client_1.Prisma.sql `AND`
        : client_1.Prisma.empty}
    ${jobTitleExists
        ? client_1.Prisma.sql `"jobTitle" IN (${client_1.Prisma.join(jobTitle)})`
        : client_1.Prisma.empty}
  `;
    return template;
}
exports.LCADisclosureStatsType = (0, nexus_1.objectType)({
    name: "LCADisclosureStats",
    definition(t) {
        t.nonNull.int("totalCount");
        t.nonNull.float("successPercentage");
    },
});
