import * as trpc from "@trpc/server";

import { Context } from "./context";
import { prismaLcaDataFormatter } from "@/server/formatters/lca";

export const serverRouter = trpc
  .router<Context>()
  .query("lca.findAll", {
    resolve: async ({ ctx }) => {
      const prismaLCAData = await ctx.prisma.lca_disclosures.findMany();
      const formattedLCAData = prismaLCAData.map(prismaLcaDataFormatter)
      return formattedLCAData;
    },
  });

export type ServerRouter = typeof serverRouter;
