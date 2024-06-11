import { extendType, objectType } from "nexus";
import { SOCJob } from "nexus-prisma";
import { NexusGenObjects } from "../../nexus-typegen";

export const SOCJobType = objectType({
  name: SOCJob.$name,
  description: SOCJob.$description,
  definition(t) {
    t.field(SOCJob.code);
    t.field(SOCJob.title);
  },
})

const socJobs: NexusGenObjects["SOCJob"][] = [
  {
    code: 'testing0',
    title: 'Testing 0',
  },
  {
    code: 'testing1',
    title: 'Testing 1',
  }
];

export const socJobsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('socJobs', {
      type: 'SOCJob',
      resolve(parent, args, context, info) {
        return context.prisma.sOCJob.findMany();
      }
    })
  }
})
