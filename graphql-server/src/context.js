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
exports.prisma = new client_1.PrismaClient({
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
exports.context = {
    prisma: exports.prisma,
};
exports.prisma.$on("query", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Query: ${e.query}\nParams: ${e.params}\nDuration: ${e.duration}ms\n`);
}));
exports.prisma.$on("error", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(`${e.message}`);
}));
exports.prisma.$on("info", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(`${e.message}`);
}));
exports.prisma.$on("warn", (e) => __awaiter(void 0, void 0, void 0, function* () {
    console.warn(`${e.message}`);
}));
