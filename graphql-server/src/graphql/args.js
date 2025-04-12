"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateTimeArg = void 0;
const nexus_1 = require("nexus");
const dateTimeArg = (opts) => (0, nexus_1.arg)(Object.assign(Object.assign({}, opts), { type: "DateTime" }));
exports.dateTimeArg = dateTimeArg;
