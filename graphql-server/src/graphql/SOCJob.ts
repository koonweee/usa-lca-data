import { objectType } from "nexus";
import { SOCJob } from "nexus-prisma";

export const SOCJobType = objectType({
  name: SOCJob.$name,
  description: SOCJob.$description,
  definition(t) {
    t.field(SOCJob.code);
    t.field(SOCJob.title);
  },
})
