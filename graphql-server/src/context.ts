import { PrismaClient } from "@prisma/client";
import { limitedDatabaseUrl } from "./protection";
export const prisma = new PrismaClient({
  datasources: { db: { url: limitedDatabaseUrl(process.env.DATABASE_URL!) } },
  log: [
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
    {
      emit: "event",
      level: "error",
    },
  ],
});

export interface Context {
  prisma: PrismaClient;
}

export const context: Context = {
  prisma,
};

prisma.$on("error", async (e) => {
  console.error(`${e.message}`);
});

prisma.$on("info", async (e) => {
  console.info(`${e.message}`);
});

prisma.$on("warn", async (e) => {
  console.warn(`${e.message}`);
});
