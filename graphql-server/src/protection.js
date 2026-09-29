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
exports.protectionPlugin = exports.LIMITS = void 0;
exports.paginationBounds = paginationBounds;
exports.validateArguments = validateArguments;
exports.checkOperation = checkOperation;
exports.limitedDatabaseUrl = limitedDatabaseUrl;
const graphql_1 = require("graphql");
const values_1 = require("graphql/execution/values");
exports.LIMITS = { page: 100, defaultPage: 20, offset: 100000, search: 200, filters: 50, depth: 10, fields: 200, databaseFields: 10, cost: 10000, tokens: 2000 };
function reject(message) {
    throw new graphql_1.GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } } });
}
function paginationBounds(value) {
    var _a, _b;
    const skip = (_a = value === null || value === void 0 ? void 0 : value.skip) !== null && _a !== void 0 ? _a : 0, take = (_b = value === null || value === void 0 ? void 0 : value.take) !== null && _b !== void 0 ? _b : exports.LIMITS.defaultPage;
    if (!Number.isInteger(skip) || skip < 0 || skip > exports.LIMITS.offset)
        reject(`pagination.skip must be between 0 and ${exports.LIMITS.offset}`);
    if (!Number.isInteger(take) || take < 1 || take > exports.LIMITS.page)
        reject(`pagination.take must be between 1 and ${exports.LIMITS.page}`);
    return { skip, take };
}
function validateArguments(args) {
    var _a;
    if ('pagination' in args)
        paginationBounds(args.pagination);
    for (const key of ['employerNameSearchStr', 'jobTitleSearchStr']) {
        if (args[key] != null && args[key].length > exports.LIMITS.search)
            reject(`${key} must be at most ${exports.LIMITS.search} characters`);
    }
    for (const [key, values] of Object.entries((_a = args.filters) !== null && _a !== void 0 ? _a : {})) {
        if (!values)
            continue;
        if (values.length > exports.LIMITS.filters)
            reject(`filters.${key} must contain at most ${exports.LIMITS.filters} values`);
        if (values.some(value => value.length > 500))
            reject(`filters.${key} values must be at most 500 characters`);
        if (key === 'employerUuid' && values.some(value => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)))
            reject('filters.employerUuid must contain UUIDs');
    }
}
// Runs for every request, including Apollo document-cache hits. Expand fragment
// occurrences and count aliases conservatively, regardless of skip/include.
function checkOperation(schema, document, operation, rawVariables) {
    var _a;
    const variables = (0, values_1.getVariableValues)(schema, (_a = operation.variableDefinitions) !== null && _a !== void 0 ? _a : [], rawVariables, { maxErrors: 10 });
    if (variables.errors)
        reject(variables.errors[0].message);
    const fragments = new Map();
    for (const node of document.definitions)
        if (node.kind === graphql_1.Kind.FRAGMENT_DEFINITION)
            fragments.set(node.name.value, node);
    let fields = 0, databaseFields = 0, cost = 0;
    function walk(set, parent, depth, multiplier, page, path) {
        if (depth > exports.LIMITS.depth)
            reject(`Query depth exceeds ${exports.LIMITS.depth}`);
        for (const node of set.selections) {
            if (node.kind !== graphql_1.Kind.FIELD) {
                const fragment = node.kind === graphql_1.Kind.FRAGMENT_SPREAD ? fragments.get(node.name.value) : node;
                if (!fragment)
                    continue;
                const name = node.kind === graphql_1.Kind.FRAGMENT_SPREAD ? node.name.value : undefined;
                if (name && path.has(name))
                    reject('Cyclic fragments are not allowed');
                const next = new Set(path);
                if (name)
                    next.add(name);
                const type = fragment.typeCondition ? schema.getType(fragment.typeCondition.name.value) : parent;
                if ((0, graphql_1.isObjectType)(type))
                    walk(fragment.selectionSet, type, depth, multiplier, page, next);
                continue;
            }
            if (++fields > exports.LIMITS.fields)
                reject(`Query exceeds ${exports.LIMITS.fields} field occurrences`);
            const field = parent.getFields()[node.name.value];
            if (!field)
                continue; // __typename and validation-rejected unknown fields
            const args = (0, values_1.getArgumentValues)(field, node, variables.coerced);
            validateArguments(args);
            const dbField = ['items', 'stats', 'employers', 'jobTitles', 'caseStatuses', 'dataCoverage'].includes(node.name.value);
            if (dbField && ++databaseFields > exports.LIMITS.databaseFields)
                reject(`Query exceeds ${exports.LIMITS.databaseFields} database fields`);
            const size = field.args.some(arg => arg.name === 'pagination') ? paginationBounds(args.pagination).take : page;
            const factor = node.name.value === 'items' ? size : node.name.value === 'uniqueValues' ? (parent.name === 'UniqueCaseStatuses' ? 4 : size) : 1;
            const childMultiplier = multiplier * factor;
            cost += childMultiplier + (dbField ? 100 : 0);
            if (cost > exports.LIMITS.cost)
                reject(`Query cost exceeds ${exports.LIMITS.cost}`);
            const type = (0, graphql_1.getNamedType)(field.type);
            if (node.selectionSet && (0, graphql_1.isObjectType)(type))
                walk(node.selectionSet, type, depth + 1, childMultiplier, size, path);
        }
    }
    const root = schema.getQueryType();
    if (!root || operation.operation !== 'query')
        reject('Only query operations are supported');
    walk(operation.selectionSet, root, 1, 1, exports.LIMITS.defaultPage, new Set());
}
exports.protectionPlugin = {
    requestDidStart() {
        return __awaiter(this, void 0, void 0, function* () {
            return { didResolveOperation(ctx) {
                    return __awaiter(this, void 0, void 0, function* () { var _a; checkOperation(ctx.schema, ctx.document, ctx.operation, (_a = ctx.request.variables) !== null && _a !== void 0 ? _a : {}); });
                } };
        });
    },
};
function limitedDatabaseUrl(raw, timeoutMs = 5000) {
    var _a;
    const url = new URL(raw);
    // Startup options apply to every pooled connection, including raw SQL. The
    // final setting wins while preserving existing options and URL parameters.
    url.searchParams.set('options', `${(_a = url.searchParams.get('options')) !== null && _a !== void 0 ? _a : ''} -c statement_timeout=${timeoutMs}`.trim());
    return url.toString();
}
