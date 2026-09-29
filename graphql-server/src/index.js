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
const schema_1 = require("./schema");
const context_1 = require("./context");
const cacheControl_1 = require("@apollo/server/plugin/cacheControl");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const http_1 = require("http");
const http_2 = require("./http");
const protection_1 = require("./protection");
function startApolloServer() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const app = (0, http_2.createHttpApp)(Number((_a = process.env.TRUST_PROXY_HOPS) !== null && _a !== void 0 ? _a : 0));
        const httpServer = (0, http_1.createServer)(app);
        httpServer.requestTimeout = 10000;
        httpServer.headersTimeout = 5000;
        const server = new server_1.ApolloServer({
            schema: schema_1.schema,
            allowBatchedHttpRequests: false,
            parseOptions: { maxTokens: protection_1.LIMITS.tokens },
            plugins: [protection_1.protectionPlugin, (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
                (0, cacheControl_1.ApolloServerPluginCacheControl)({ defaultMaxAge: 3600 * 6, calculateHttpHeaders: true })],
        });
        yield server.start();
        app.use('/', (0, express4_1.expressMiddleware)(server, { context: () => __awaiter(this, void 0, void 0, function* () { return context_1.context; }) }));
        // Fail startup if a driver/configuration change silently drops the DB timeout.
        const timeout = yield context_1.context.prisma.$queryRaw `SHOW statement_timeout`;
        if (((_b = timeout[0]) === null || _b === void 0 ? void 0 : _b.statement_timeout) !== '5s')
            throw new Error('Database statement timeout is not active');
        yield new Promise(resolve => httpServer.listen(4000, resolve));
        console.log('GraphQL ready on port 4000; database statement timeout 5s');
    });
}
startApolloServer().catch(() => { console.error('GraphQL startup failed'); process.exit(1); });
