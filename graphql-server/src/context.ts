import { PrismaClient } from "@prisma/client";
import fs from "fs";
export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export interface Context {
  prisma: PrismaClient;
}

export const context: Context = {
  prisma,
};
