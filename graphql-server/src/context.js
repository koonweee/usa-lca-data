"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.context = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const protection_1 = require("./protection");
exports.prisma = new client_1.PrismaClient({
    datasources: { db: { url: (0, protection_1.limitedDatabaseUrl)(process.env.DATABASE_URL) } },
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
exports.context = {
    prisma: exports.prisma,
};
exports.prisma.$on("error", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(`${e.message}`);
}));
exports.prisma.$on("info", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`${e.message}`);
}));
exports.prisma.$on("warn", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.warn(`${e.message}`);
}));
