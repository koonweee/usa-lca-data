"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GQLDate = void 0;
const nexus_1 = require("nexus");
const graphql_scalars_1 = require("graphql-scalars");
exports.GQLDate = (0, nexus_1.asNexusMethod)(graphql_scalars_1.GraphQLDateTime, "dateTime");
