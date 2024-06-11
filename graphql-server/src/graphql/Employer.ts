import { extendType, objectType, stringArg } from "nexus";
import { Employer } from "nexus-prisma";

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
})

export const employerQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('employers', {
      type: 'Employer',
      args: {
        searchStr: stringArg(),
      },
      resolve(parent, args, context, info) {
        const { searchStr } = args
        const where = searchStr ? {
          name: { contains: searchStr }
        } : {}
        return context.prisma.employer.findMany(
          { where }
        );
      }
    })
  }
})
