import { asNexusMethod } from "nexus";
import { GraphQLBigInt } from "graphql-scalars";

export const GQLBigInt = asNexusMethod(GraphQLBigInt, "bigInt");
