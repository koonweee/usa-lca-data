import { prisma } from "../graphql-server/src/db"

export type RawDiscolsureDataRow = Parameters<typeof prisma.rawDisclosureData.create>[0]['data']
