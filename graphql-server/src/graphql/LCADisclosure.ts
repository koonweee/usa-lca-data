import { Prisma } from "@prisma/client";
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

export const VisaClassFacet = objectType({
  name: "VisaClassFacet",
  definition(t) {
    t.nonNull.field("visaClass", { type: "visaclass" });
    t.nonNull.int("count");
  },
});

export const CaseStatusFacet = objectType({
  name: "CaseStatusFacet",
  definition(t) {
    t.nonNull.field("caseStatus", { type: "casestatus" });
    t.nonNull.int("count");
  },
});

export const LCADisclosuresType = objectType({
  name: "LCADisclosures",
  definition(t) {
    t.nonNull.list.nonNull.field("items", { type: "LCADisclosure" });
    t.nonNull.int("count");
    t.nonNull.list.nonNull.field("uniqueVisaClassFacets", { type: "VisaClassFacet" });
    t.nonNull.list.nonNull.field("uniqueCaseStatusFacets", { type: "CaseStatusFacet" });
  },
});

export const lcaDisclosureQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("lcaDisclosures", {
      type: "LCADisclosures",
      args: {
        /** Job filter options */
        jobTitleSearchStr: stringArg({
          description: "Filter for job titles containing this string",
        }),
        jobSOCCodes: list(
          nonNull(
            stringArg({
              description: "Filter for jobs with this exact job SOC code",
            })
          )
        ),
        /** Employer filter options */
        employerNameSearchStr: stringArg({
          description: "Filter for employers containing this string",
        }),
        employerNames: list(
          nonNull(
            stringArg({
              description: "Filter for jobs with this exact employer name",
            })
          )
        ),
        employerUuids: list(
          nonNull(
            stringArg({
              description: "Filter for jobs with this exact employer UUID",
            })
          )
        ),
        employerStates: list(
          nonNull(
            stringArg({
              description: "Filter for jobs with this exact employer state",
            })
          )
        ),
        employerCities: list(
          nonNull(
            stringArg({
              description: "Filter for jobs with this exact employer city",
            })
          )
        ),
        /** Date filter options */
        decisionDateMin: dateTimeArg({
          description:
            "Filter for jobs with decision date greater than or equal to this",
        }),
        decisionDateMax: dateTimeArg({
          description:
            "Filter for jobs with decision date less than or equal to this",
        }),
        beginDateMin: dateTimeArg({
          description:
            "Filter for jobs with begin date greater than or equal to this",
        }),
        beginDateMax: dateTimeArg({
          description:
            "Filter for jobs with begin date less than or equal to this",
        }),
        /** Wage filter options */
        wageMin: intArg({
          description:
            "Filter for jobs with wage greater than or equal to this",
          default: 0,
        }),
        wageMax: intArg({
          description: "Filter for jobs with wage less than or equal to this",
        }),
        /** Case status options */
        caseStatuses: list(nonNull(arg({ type: caseStatusType }))),
        /** Visa class options */
        visaClasses: list(nonNull(arg({ type: visaClassType }))),
        /** Pagination options */
        skip: intArg({ description: "Number of records to skip", default: 0 }),
        take: intArg({
          description: "Number of records to take (max 500)",
          default: 50,
        }),
        /** Sorting options */
        orderBy: arg({ type: list(nonNull(LCADisclosureOrderByInput)) }),
      },
      resolve(parent, args, context, info) {
        const {
          jobTitleSearchStr,
          jobSOCCodes,
          employerNameSearchStr,
          employerNames,
          employerUuids,
          employerStates,
          employerCities,
          decisionDateMin,
          decisionDateMax,
          beginDateMin,
          beginDateMax,
          wageMin,
          wageMax,
          caseStatuses,
          visaClasses,
          skip,
          take,
          orderBy,
        } = args;
        // Throw if take > 500
        if (take && take > 500) {
          throw new Error("Cannot take more than 500 records");
        }

        const where: Prisma.LCADisclosureWhereInput = {};

        if (jobTitleSearchStr) {
          where.jobTitle = { contains: jobTitleSearchStr, mode: "insensitive" };
        }

        if (jobSOCCodes) {
          where.socCode = { in: jobSOCCodes };
        }

        if (employerUuids) {
          where.employerUuid = { in: employerUuids };
        }

        const employerWhere: Prisma.EmployerWhereInput = {};

        if (employerNameSearchStr) {
          employerWhere.name = {
            contains: employerNameSearchStr,
            mode: "insensitive",
          };
        }

        if (employerNames) {
          employerWhere.name = { in: employerNames, mode: "insensitive" };
        }

        if (employerStates) {
          employerWhere.state = { in: employerStates, mode: "insensitive" };
        }

        if (employerCities) {
          employerWhere.city = { in: employerCities, mode: "insensitive" };
        }

        if (Object.keys(employerWhere).length > 0) {
          where.employer = employerWhere;
        }

        if (decisionDateMin) {
          where.decisionDate = {
            ...(typeof where.decisionDate === "object"
              ? where.decisionDate
              : {}),
            gte: decisionDateMin,
          };
        }

        if (decisionDateMax) {
          where.decisionDate = {
            ...(typeof where.decisionDate === "object"
              ? where.decisionDate
              : {}),
            lte: decisionDateMax,
          };
        }

        if (beginDateMin) {
          where.beginDate = {
            ...(typeof where.beginDate === "object" ? where.beginDate : {}),
            gte: beginDateMin,
          };
        }

        if (beginDateMax) {
          where.beginDate = {
            ...(typeof where.beginDate === "object" ? where.beginDate : {}),
            lte: beginDateMax,
          };
        }

        if (wageMin) {
          where.wageRateOfPayFrom = {
            ...(typeof where.wageRateOfPayFrom === "object"
              ? where.wageRateOfPayFrom
              : {}),
            gte: wageMin,
          };
        }

        if (wageMax) {
          where.wageRateOfPayFrom = {
            ...(typeof where.wageRateOfPayFrom === "object"
              ? where.wageRateOfPayFrom
              : {}),
            lte: wageMax,
          };
        }

        if (caseStatuses) {
          where.caseStatus = { in: caseStatuses };
        }

        if (visaClasses) {
          where.visaClass = { in: visaClasses };
        }

        const disclosures = context.prisma.lCADisclosure.findMany({
          where,
          skip: skip ?? undefined,
          take: take ?? undefined,
          orderBy: orderBy
            ? (orderBy as Prisma.Enumerable<Prisma.LCADisclosureOrderByWithRelationInput>)
            : undefined,
        });

        const count = context.prisma.lCADisclosure.count({ where });

        // Faceted unique value counts for filtering (visaClasses, caseStatuses)
        const uniqueVisaClassFacets = context.prisma.lCADisclosure.groupBy({
          by: "visaClass",
          _count: { visaClass: true },
          where,
        }).then((res: any) => res.map((r: any) => ({ visaClass: r.visaClass, count: r._count.visaClass })))

        const uniqueCaseStatusFacets = context.prisma.lCADisclosure.groupBy({
          by: ["caseStatus"],
          _count: { caseStatus: true },
          where
        }).then((res: any) => res.map((r: any) => ({ caseStatus: r.caseStatus, count: r._count.caseStatus })))

        return {
          items: disclosures,
          count,
          uniqueVisaClassFacets: uniqueVisaClassFacets,
          uniqueCaseStatusFacets: uniqueCaseStatusFacets,
        };
      },
    });
  },
});

export const LCADisclosureOrderByInput = inputObjectType({
  name: "LCADisclosureOrderByInput",
  definition(t) {
    t.field("decisionDate", { type: "SortOrder" });
    t.field("receivedDate", { type: "SortOrder" });
    t.field("beginDate", { type: "SortOrder" });
    t.field("wageRateOfPayFrom", { type: "SortOrder" });
  },
});

export const SortOrder = enumType({
  name: "SortOrder",
  members: ["asc", "desc"],
});
