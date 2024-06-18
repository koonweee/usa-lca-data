import { $Enums, Prisma, Employer } from "@prisma/client";
import {
  arg,
  enumType,
  extendType,
  inputObjectType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";
import { LCADisclosure, casestatus, payunit, visaclass } from "nexus-prisma";
import { dateTimeArg } from "./args";
import { ArgsRecord, Maybe } from "nexus/dist/core";
import { NexusGenInputs, NexusGenRootTypes } from "../../nexus-typegen";
import { Sql } from "@prisma/client/runtime/library";

export const payUnitType = enumType(payunit);
export const caseStatusType = enumType(casestatus);
export const visaClassType = enumType(visaclass);

export const VISA_CLASS_ENUM_TO_READABLE: Record<$Enums.visaclass, string> = {
  H_1B: "H-1B",
  H_1B1_Chile: "H-1B1 Chile",
  H_1B1_Singapore: "H-1B1 Singapore",
  E_3_Australian: "E-3 Australian",
};

export const CASE_STATUS_ENUM_TO_READABLE: Record<$Enums.casestatus, string> = {
  Certified: "Certified",
  Certified___Withdrawn: "Certified - Withdrawn",
  Denied: "Denied",
  Withdrawn: "Withdrawn",
};

export const LCADisclosureType = objectType({
  name: LCADisclosure.$name,
  description: LCADisclosure.$description,
  definition(t) {
    t.field(LCADisclosure.caseNumber);
    t.field(LCADisclosure.jobTitle);
    t.field(LCADisclosure.socCode);
    t.field(LCADisclosure.fullTimePosition);
    t.field(LCADisclosure.receivedDate);
    t.field(LCADisclosure.decisionDate);
    t.field(LCADisclosure.beginDate);
    t.field(LCADisclosure.worksitePostalCode);
    t.field(LCADisclosure.wageRateOfPayFrom);
    t.field(LCADisclosure.wageRateOfPayTo);
    t.field(LCADisclosure.prevailingWageRateOfPay);
    t.field(LCADisclosure.worksiteCity);
    t.field(LCADisclosure.worksiteState);
    t.field(LCADisclosure.wageRateOfPayUnit);
    t.field(LCADisclosure.prevailingWageRateOfPayUnit);
    t.field(LCADisclosure.caseStatus);
    t.field(LCADisclosure.visaClass);
    t.field(LCADisclosure.employer);
    t.field(LCADisclosure.socJob);
  },
});

// export const LCADisclosureOrderByInput = inputObjectType({
//   name: "LCADisclosureOrderByInput",
//   definition(t) {
//     t.field("decisionDate", { type: "SortOrder" });
//     t.field("receivedDate", { type: "SortOrder" });
//     t.field("beginDate", { type: "SortOrder" });
//     t.field("wageRateOfPayFrom", { type: "SortOrder" });
//   },
// });

// export const SortOrder = enumType({
//   name: "SortOrder",
//   members: ["asc", "desc"],
// });

export const UniqueVisaClassesType = objectType({
  name: "UniqueVisaClasses",
  definition(t) {
    t.nonNull.list.nonNull.field("uniqueValues", { type: "VisaClassAndCount" });
  },
});

export const VisaClassAndCountType = objectType({
  name: "VisaClassAndCount",
  definition(t) {
    t.nonNull.field("visaClass", { type: "visaclass" });
    t.nonNull.int("count");
  },
});

export const UniqueCaseStatusesType = objectType({
  name: "UniqueCaseStatuses",
  definition(t) {
    t.nonNull.list.nonNull.field("uniqueValues", {
      type: "CaseStatusAndCount",
    });
  },
});

export const caseStatusAndCountType = objectType({
  name: "CaseStatusAndCount",
  definition(t) {
    t.nonNull.field("caseStatus", { type: "casestatus" });
    t.nonNull.int("count");
  },
});

export const UniqueEmployersType = objectType({
  name: "UniqueEmployers",
  definition(t) {
    t.nonNull.list.nonNull.field("uniqueValues", {
      type: "Employer",
    });
    t.boolean("hasNext");
  },
});

export const EmployerAndCountType = extendType({
  type: "Employer",
  definition(t) {
    t.nonNull.int("count");
  },
});

export const LCADisclosuresType = objectType({
  name: "LCADisclosures",
  definition(t) {
    t.nonNull.list.nonNull.field("items", { type: "LCADisclosure" });
    t.nonNull.int("totalCount");
    t.boolean("hasNext");
  },
});

export const lcaDisclosureFiltersInput = inputObjectType({
  name: "LCADisclosureFilters",
  definition(t) {
    t.list.nonNull.string("employerUuid");
    t.list.nonNull.field("caseStatus", { type: "casestatus" });
    t.list.nonNull.field("visaClass", { type: "visaclass" });
  },
});

export const paginationInput = inputObjectType({
  name: "PaginationInput",
  definition(t) {
    t.int("skip");
    t.int("take");
  },
});

export const PaginatedLCADisclosuresUniqueColumnValuesType = objectType({
  name: "PaginatedLCADisclosuresUniqueColumnValues",
  definition(t) {
    t.nonNull.field("visaClasses", {
      type: "UniqueVisaClasses",
      description: "Unique visa classes in the result set for a given filter",
      args: {
        filters: arg({
          type: "LCADisclosureFilters",
          description: "Filter options",
        }),
      },
      resolve: async (_parent, args, context, _info) => {
        const { filters } = args;
        const where = constructPrismaWhereFromFilters(filters ?? {});

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
      },
    });
    t.nonNull.field("caseStatuses", {
      type: "UniqueCaseStatuses",

      description: "Unique case statuses in the result set for a given filter",
      args: {
        filters: arg({
          type: "LCADisclosureFilters",
          description: "Filter options",
        }),
      },
      resolve: (_parent, args, context, _info) => {
        const { filters } = args;
        const where = constructPrismaWhereFromFilters(filters ?? {});

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
    t.nonNull.field("employers", {
      type: "UniqueEmployers",
      description: "Unique employers in the result set for a given filter",
      args: {
        filters: arg({
          type: "LCADisclosureFilters",
          description: "Filter options",
        }),
        employerNameSearchStr: stringArg({
          description: "Search string for employer name",
        }),
        pagination: arg({
          type: "PaginationInput",
          description: "Pagination options",
        }),
      },
      resolve: async (_parent, args, context, _info) => {
        const { filters, pagination, employerNameSearchStr } = args;
        const { skip, take } = pagination ?? {};

        const where = constructPrismaWhereFromFilters(filters ?? {});

        if (employerNameSearchStr) {
          where.employer = {
            name: { search: employerNameSearchStr, mode: "insensitive" },
          };
        }

        const results = await context.prisma.lCADisclosure.findMany({
          where,
          distinct: ["employerUuid"],
          select: { employer: true },
          skip: skip ?? undefined,
          take: take ? take + 1 : undefined,
          orderBy: { employer: { name: "asc" } },
        });

        const filtersWhereClauses = constructTemplateStringWhereFromFilters(
          filters ?? {}
        );

        const searchStrWhereClase =
          employerNameSearchStr && employerNameSearchStr.length > 0
            ? Prisma.sql`to_tsvector("public"."Employer"."name") @@ phraseto_tsquery(${employerNameSearchStr})`
            : undefined;

        const whereExists = filtersWhereClauses || searchStrWhereClase;

        const whereTemplate = whereExists
          ? Prisma.sql`WHERE ${Prisma.join(
              [filtersWhereClauses, searchStrWhereClase].filter(
                (clause) => !!clause
              ),
              "AND "
            )}`
          : Prisma.empty;

        const uniqueEmployersAndCounts = context.prisma.$queryRaw<
          (Employer & { count: BigInt })[]
        >`
          SELECT "public"."Employer".*, count(*) as count
          FROM "public"."LCADisclosure"
          INNER JOIN "public"."Employer" ON "public"."LCADisclosure"."employerUuid" = "public"."Employer"."uuid"
          ${whereTemplate}
          GROUP BY "public"."Employer"."uuid"
          ORDER BY "public"."Employer"."name" ASC
          ${take ? Prisma.sql`LIMIT ${take + 1}` : Prisma.empty}
          ${skip ? Prisma.sql`OFFSET ${skip}` : Prisma.empty}
        `;

        const resultsProcessed = {
          uniqueValues: take
            ? results.map((r) => r.employer).slice(0, take)
            : results.map((r) => r.employer),
          hasNext: !take || results.length > take,
        };

        return uniqueEmployersAndCounts.then((employers) => {
          // Convert big int to int
          const employersProcessed = employers.map((employer) => ({
            ...employer,
            count: Number(employer.count),
          }));
          return {
            uniqueValues: take
              ? employersProcessed.slice(0, take)
              : employersProcessed,
            hasNext: !take || results.length > take,
          };
        });
      },
    });
  },
});

export const lcaDisclosureQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("lcaDisclosures", {
      type: "LCADisclosures",
      args: {
        filters: arg({
          type: "LCADisclosureFilters",
          description: "Filter options",
        }),
        pagination: arg({
          type: "PaginationInput",
          description: "Pagination options",
        }),
      },
      async resolve(parent, args, context, info) {
        const { filters, pagination } = args;
        const { skip, take } = pagination ?? {};

        const where = constructPrismaWhereFromFilters(filters ?? {});

        // Fetch all disclosures and total count
        const count = context.prisma.lCADisclosure.count({ where });
        const disclosureItems = context.prisma.lCADisclosure.findMany({
          where,
          skip: skip ?? undefined,
          take: take ? take + 1 : undefined,
          orderBy: { beginDate: "desc" },
        });

        const returnObj = Promise.all([disclosureItems, count]).then(
          ([items, totalCount]) => {
            return {
              items: take ? items.slice(0, take) : items,
              totalCount,
              hasNext: !take || items.length > take,
            };
          }
        );

        return returnObj;
      },
    });
    t.nonNull.field("uniqueColumnValues", {
      type: "PaginatedLCADisclosuresUniqueColumnValues",
      resolve: () => ({}),
    });
  },
});

function constructPrismaWhereFromFilters(
  filters: NexusGenInputs["LCADisclosureFilters"]
): Prisma.LCADisclosureWhereInput {
  // Build where clause from filters
  const { employerUuid, caseStatus, visaClass } = filters ?? {};

  const where: Prisma.LCADisclosureWhereInput = {};

  if (caseStatus && caseStatus.length > 0) {
    where.caseStatus = { in: caseStatus };
  }

  if (visaClass && visaClass.length > 0) {
    where.visaClass = { in: visaClass };
  }

  if (employerUuid && employerUuid.length > 0) {
    where.employerUuid = { in: employerUuid };
  }

  return where;
}

function constructTemplateStringWhereFromFilters(
  filters: NexusGenInputs["LCADisclosureFilters"]
): Sql | undefined {
  const { employerUuid, caseStatus, visaClass } = filters ?? {};

  const caseStatusExists = caseStatus && caseStatus.length > 0;
  const visaClassExists = visaClass && visaClass.length > 0;
  const employerUuidExists = employerUuid && employerUuid.length > 0;

  if (!caseStatusExists && !visaClassExists && !employerUuidExists) {
    return undefined;
  }

  const template = Prisma.sql`
    ${
      caseStatusExists
        ? Prisma.sql`"caseStatus" IN (${Prisma.join(
            caseStatus.map(
              (status) =>
                Prisma.sql`CAST(${CASE_STATUS_ENUM_TO_READABLE[status]}::text as "public"."casestatus")`
            )
          )})`
        : Prisma.empty
    }
    ${caseStatusExists && visaClassExists ? Prisma.sql`AND` : Prisma.empty}
    ${
      visaClassExists
        ? Prisma.sql`"visaClass" IN (${Prisma.join(
            visaClass.map(
              (visa) =>
                Prisma.sql`CAST(${VISA_CLASS_ENUM_TO_READABLE[visa]}::text as "public"."visaclass")`
            )
          )})`
        : Prisma.empty
    }
    ${
      (caseStatusExists || visaClassExists) && employerUuidExists
        ? Prisma.sql`AND`
        : Prisma.empty
    }
    ${
      employerUuidExists
        ? Prisma.sql`"employerUuid" IN (${Prisma.join(employerUuid)})`
        : Prisma.empty
    }
  `;

  return template;
}
