import * as trpc from "@trpc/server";

import { Context } from "./context";
import { prismaLcaDataFormatter } from "@/server/formatters/lca";

import Fuse from 'fuse.js'


// demo here - https://www.fusejs.io/demo.html
const fuseOptions = {
	isCaseSensitive: false,
	// includeScore: false,
	shouldSort: true,
	// includeMatches: false,
	findAllMatches: true,
	// minMatchCharLength: 1,
	// location: 0,
	threshold: 0.1,
	// distance: 100,
	// useExtendedSearch: false,
	// ignoreLocation: false,
	// ignoreFieldNorm: false,
	// fieldNormWeight: 1,
	keys: [ "searchableText" ]
};
import { z } from 'zod';



export const serverRouter = trpc
  .router<Context>()
  .query("lca.findAll", {
    input: z.object({
      searchQuery: z.string().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      const prismaLCAData = await ctx.prisma.lca_disclosures.findMany();
      let prismaLCADataResults = prismaLCAData;
      
      if (input?.searchQuery) {
        const fuse = new Fuse(prismaLCAData, fuseOptions);
        prismaLCADataResults = fuse.search(input.searchQuery).map((searchResult) => searchResult.item);
      }

      const formattedLCAData = prismaLCADataResults.map(prismaLcaDataFormatter)
      return formattedLCAData;
    },
  });

export type ServerRouter = typeof serverRouter;
