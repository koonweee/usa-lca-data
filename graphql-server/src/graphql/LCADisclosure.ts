import { $Enums, Prisma } from "@prisma/client";
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
import {
  Employer,
  LCADisclosure,
  casestatus,
  payunit,
  visaclass,
} from "nexus-prisma";
import { dateTimeArg } from "./args";
import { ArgsRecord, Maybe } from "nexus/dist/core";
import { NexusGenInputs, NexusGenRootTypes } from "../../nexus-typegen";

export const payUnitType = enumType(payunit);
export const caseStatusType = enumType(casestatus);
export const visaClassType = enumType(visaclass);

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
    t.nonNull.list.nonNull.field("uniqueValues", { type: "visaclass" });
  },
});

export const UniqueCaseStatusesType = objectType({
  name: "UniqueCaseStatuses",
  definition(t) {
    t.nonNull.list.nonNull.field("uniqueValues", { type: "casestatus" });
  },
});

export const UniqueEmployersType = objectType({
  name: "UniqueEmployers",
  definition(t) {
    t.nonNull.list.nonNull.field("uniqueValues", { type: "Employer" });
    t.boolean("hasNext");
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
      resolve: (_parent, args, context, _info) => {
        const { filters } = args;
        const where = constructPrismaWhereFromFilters(filters ?? {});
        return context.prisma.lCADisclosure
          .findMany({
            where,
            distinct: ["visaClass"],
            select: { visaClass: true },
          })
          .then((result: { visaClass: $Enums.visaclass }[]) => {
            return { uniqueValues: result.map((r) => r.visaClass) };
          });
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
        return context.prisma.lCADisclosure
          .findMany({
            where,
            distinct: ["caseStatus"],
            select: { caseStatus: true },
          })
          .then((result: { caseStatus: $Enums.casestatus }[]) => {
            return { uniqueValues: result.map((r) => r.caseStatus) };
          });
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
        const startTime = Date.now();

        const results = await context.prisma.lCADisclosure.findMany({
          where,
          distinct: ["employerUuid"],
          select: { employer: true },
          skip: skip ?? undefined,
          take: take ? take + 1 : undefined,
          orderBy: { employer: { name: "asc" } },
        });
        // console.log("where: ", where);
        // console.log("Unique employers query time: ", Date.now() - startTime);

        const resultsProcessed = {
          uniqueValues: take
            ? results.map((r) => r.employer).slice(0, take)
            : results.map((r) => r.employer),
          hasNext: !take || results.length > take,
        };

        return resultsProcessed;
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

  // if (employerNameSearchStr) {
  //   where.employer = {
  //     name: { search: employerNameSearchStr, mode: "insensitive" },
  //   };
  // }
  return where;
}
