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
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
function startApolloServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = new server_1.ApolloServer({
            schema: schema_1.schema,
            plugins: [
                (0, cacheControl_1.ApolloServerPluginCacheControl)({
                    // Cache everything for 1 second by default.
                    defaultMaxAge: 3600 * 6, // 6 hours
                    // Don't send the `cache-control` response header.
                    calculateHttpHeaders: true,
                }),
            ],
        });
        const { url } = yield (0, standalone_1.startStandaloneServer)(server, {
            context: () => __awaiter(this, void 0, void 0, function* () { return context_1.context; }),
            listen: { port: 4000 },
        });
        console.log(`🚀 Server ready at ${url}`);
    });
}
startApolloServer();
