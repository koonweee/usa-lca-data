import { PrismaClient } from "@prisma/client";
import fs from "fs";
export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
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
  const write = `query: ${e.query}\nparams: ${e.params}\nduration: ${e.duration}ms\n`;
  // Append to log.json
  fs.appendFile("log.json", write, (err) => {
    if (err) {
      console.error(err);
    }
  });
});
