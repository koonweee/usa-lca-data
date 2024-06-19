import { PrismaClient } from "@prisma/client";
import fs from "fs";
export const prisma = new PrismaClient({
  // log: ["query", "info", "warn", "error"],
  log: [
    {
      emit: "event",
      level: "query",
    },
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

prisma.$on("query", async (e) => {
  console.log(
    `Query: ${e.query}\nParams: ${e.params}\nDuration: ${e.duration}ms\n`
  );
});

prisma.$on("error", async (e) => {
  console.error(`${e.message}`);
});

prisma.$on("info", async (e) => {
  console.info(`${e.message}`);
});

prisma.$on("warn", async (e) => {
  console.warn(`${e.message}`);
});
