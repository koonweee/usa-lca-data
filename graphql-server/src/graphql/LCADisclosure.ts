import { Prisma } from "@prisma/client";
import { arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg } from "nexus";
import { LCADisclosure, casestatus, payunit, visaclass } from "nexus-prisma";

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
})

export const LCADisclosuresType = objectType({
  name: 'LCADisclosures',
  definition(t) {
    t.nonNull.list.nonNull.field('items', { type: 'LCADisclosure' });
    t.nonNull.int('count');
  }
})

export const lcaDisclosureQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('lcaDisclosures', {
      type: 'LCADisclosures',
      args: {
        jobTitleSearchStr: stringArg(),
        skip: intArg(),
        take: intArg({default: 50}),
        orderBy: arg({ type: list(nonNull(LCADisclosureOrderByInput)) })
      },
      resolve(parent, args, context, info) {
        const { jobTitleSearchStr, skip, take, orderBy } = args
        // Throw if take > 500
        if (take && take > 500) {
          throw new Error('Cannot take more than 500 records')
        }
        const count = context.prisma.lCADisclosure.count()
        const baseWhere = {
          visaClass: visaclass.members[3]
        }
        const conditionalWhere = jobTitleSearchStr ?
            { jobTitle: { contains: jobTitleSearchStr } }
         : {}
        const disclosures =  context.prisma.lCADisclosure.findMany({
          where: {
            ...baseWhere,
            ...conditionalWhere
          },
          skip: skip ?? undefined,
          take: take ?? undefined,
          orderBy: orderBy ? orderBy as Prisma.Enumerable<Prisma.LCADisclosureOrderByWithRelationInput> : undefined
        });

        return {
          items: disclosures,
          count
        }
      }
    })
  }
})

export const LCADisclosureOrderByInput = inputObjectType({
  name: 'LCADisclosureOrderByInput',
  definition(t) {
    t.field('decisionDate', { type: 'SortOrder' });
    t.field('receivedDate', { type: 'SortOrder' });
    t.field('beginDate', { type: 'SortOrder' });
    t.field('wageRateOfPayFrom', { type: 'SortOrder' });
  },
})

export const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc']
})
