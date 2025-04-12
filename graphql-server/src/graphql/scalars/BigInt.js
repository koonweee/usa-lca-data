"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GQLBigInt = void 0;
const nexus_1 = require("nexus");
const graphql_scalars_1 = require("graphql-scalars");
exports.GQLBigInt = (0, nexus_1.asNexusMethod)(graphql_scalars_1.GraphQLBigInt, "bigInt");
