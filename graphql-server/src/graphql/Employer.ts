import { Prisma } from "@prisma/client";
import {
  arg,
  extendType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";
import { Employer } from "nexus-prisma";
import { caseStatusType, visaClassType } from "./LCADisclosure";

export const EmployerType = objectType({
  name: Employer.$name,
  description: Employer.$description,
  definition(t) {
    t.field(Employer.city);
    t.field(Employer.naicsCode);
    t.field(Employer.name);
    t.field(Employer.postalCode);
    t.field(Employer.state);
    t.field(Employer.uuid);
  },
});

export const PaginatedEmployerType = objectType({
  name: "PaginatedEmployer",
  definition(t) {
    t.nonNull.list.nonNull.field("items", { type: "Employer" });
    t.nonNull.boolean("hasNext");
  },
});

export const employerQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("employers", {
      type: "PaginatedEmployer",
      args: {
        searchStr: stringArg(),
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
      },
      resolve(parent, args, context, info) {
        const { searchStr, visaClasses, caseStatuses, skip, take } = args;
        const where: any = {};

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
            some: {
              ...where.lcaDisclosures?.some,
              caseStatus: {
                in: caseStatuses,
              },
            },
          };
        }

        return context.prisma.employer
          .findMany({
            where,
            skip: skip ?? undefined,
            take: take ? take + 1 : undefined,
            orderBy: {
              name: "asc",
            },
          })
          .then((result: any) => {
            return {
              items: result.slice(0, take ?? undefined),
              hasNext: !take || result.length > take,
            };
          });
      },
    });
  },
});
