import { ApolloServerPlugin } from '@apollo/server';
import { DocumentNode, FragmentDefinitionNode, getNamedType, GraphQLError, GraphQLObjectType, GraphQLSchema, isObjectType, Kind, OperationDefinitionNode, SelectionSetNode } from 'graphql';
import { getArgumentValues, getVariableValues } from 'graphql/execution/values';

export const LIMITS = { page: 100, defaultPage: 20, offset: 100000, search: 200, filters: 50, depth: 10, fields: 200, databaseFields: 10, cost: 10000, tokens: 2000 } as const;
function reject(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } } });
}
export function paginationBounds(value?: { skip?: number | null; take?: number | null } | null) {
  const skip = value?.skip ?? 0, take = value?.take ?? LIMITS.defaultPage;
  if (!Number.isInteger(skip) || skip < 0 || skip > LIMITS.offset) reject(`pagination.skip must be between 0 and ${LIMITS.offset}`);
  if (!Number.isInteger(take) || take < 1 || take > LIMITS.page) reject(`pagination.take must be between 1 and ${LIMITS.page}`);
  return { skip, take };
}
export function validateArguments(args: Record<string, any>) {
  if ('pagination' in args) paginationBounds(args.pagination);
  for (const key of ['employerNameSearchStr', 'jobTitleSearchStr']) {
    if (args[key] != null && args[key].length > LIMITS.search) reject(`${key} must be at most ${LIMITS.search} characters`);
  }
  for (const [key, values] of Object.entries(args.filters ?? {}) as [string, string[] | null][]) {
    if (!values) continue;
    if (values.length > LIMITS.filters) reject(`filters.${key} must contain at most ${LIMITS.filters} values`);
    if (values.some(value => value.length > 500)) reject(`filters.${key} values must be at most 500 characters`);
    if (key === 'employerUuid' && values.some(value => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))) reject('filters.employerUuid must contain UUIDs');
  }
}

// Runs for every request, including Apollo document-cache hits. Expand fragment
// occurrences and count aliases conservatively, regardless of skip/include.
export function checkOperation(schema: GraphQLSchema, document: DocumentNode, operation: OperationDefinitionNode, rawVariables: Record<string, unknown>) {
  const variables = getVariableValues(schema, operation.variableDefinitions ?? [], rawVariables, { maxErrors: 10 });
  if (variables.errors) reject(variables.errors[0].message);
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const node of document.definitions) if (node.kind === Kind.FRAGMENT_DEFINITION) fragments.set(node.name.value, node);
  let fields = 0, databaseFields = 0, cost = 0;
  function walk(set: SelectionSetNode, parent: GraphQLObjectType, depth: number, multiplier: number, page: number, path: Set<string>) {
    if (depth > LIMITS.depth) reject(`Query depth exceeds ${LIMITS.depth}`);
    for (const node of set.selections) {
      if (node.kind !== Kind.FIELD) {
        const fragment = node.kind === Kind.FRAGMENT_SPREAD ? fragments.get(node.name.value) : node;
        if (!fragment) continue;
        const name = node.kind === Kind.FRAGMENT_SPREAD ? node.name.value : undefined;
        if (name && path.has(name)) reject('Cyclic fragments are not allowed');
        const next = new Set(path); if (name) next.add(name);
        const type = fragment.typeCondition ? schema.getType(fragment.typeCondition.name.value) : parent;
        if (isObjectType(type)) walk(fragment.selectionSet, type, depth, multiplier, page, next);
        continue;
      }
      if (++fields > LIMITS.fields) reject(`Query exceeds ${LIMITS.fields} field occurrences`);
      const field = parent.getFields()[node.name.value];
      if (!field) continue; // __typename and validation-rejected unknown fields
      const args: Record<string, any> = getArgumentValues(field, node, variables.coerced);
      validateArguments(args);
      const dbField = ['items', 'stats', 'employers', 'jobTitles', 'caseStatuses', 'dataCoverage'].includes(node.name.value);
      if (dbField && ++databaseFields > LIMITS.databaseFields) reject(`Query exceeds ${LIMITS.databaseFields} database fields`);
      const size = field.args.some(arg => arg.name === 'pagination') ? paginationBounds(args.pagination).take : page;
      const factor = node.name.value === 'items' ? size : node.name.value === 'uniqueValues' ? (parent.name === 'UniqueCaseStatuses' ? 4 : size) : 1;
      const childMultiplier = multiplier * factor;
      cost += childMultiplier + (dbField ? 100 : 0);
      if (cost > LIMITS.cost) reject(`Query cost exceeds ${LIMITS.cost}`);
      const type = getNamedType(field.type);
      if (node.selectionSet && isObjectType(type)) walk(node.selectionSet, type, depth + 1, childMultiplier, size, path);
    }
  }
  const root = schema.getQueryType();
  if (!root || operation.operation !== 'query') reject('Only query operations are supported');
  walk(operation.selectionSet, root, 1, 1, LIMITS.defaultPage, new Set());
}
export const protectionPlugin: ApolloServerPlugin<any> = {
  async requestDidStart() {
    return { async didResolveOperation(ctx) { checkOperation(ctx.schema, ctx.document, ctx.operation!, ctx.request.variables ?? {}); } };
  },
};

export function limitedDatabaseUrl(raw: string, timeoutMs = 5000): string {
  const url = new URL(raw);
  // Startup options apply to every pooled connection, including raw SQL. The
  // final setting wins while preserving existing options and URL parameters.
  url.searchParams.set('options', `${url.searchParams.get('options') ?? ''} -c statement_timeout=${timeoutMs}`.trim());
  return url.toString();
}
