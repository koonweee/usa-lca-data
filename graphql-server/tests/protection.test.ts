import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import { makeSchema } from 'nexus';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'node:http';
import { PrismaClient } from '@prisma/client';
import { getOperationAST, parse } from 'graphql';
import * as types from '../src/graphql';
import { checkOperation, limitedDatabaseUrl, LIMITS, paginationBounds, protectionPlugin } from '../src/protection';
import { createHttpApp } from '../src/http';
const schema = makeSchema({ types, outputs: false });
function check(source: string, variables = {}) { const document = parse(source); checkOperation(schema, document, getOperationAST(document)!, variables); }
test('frontend documents fit budgets at maximum page size', () => {
  for (const file of readdirSync('../react-client/src/queries').filter(f => f.endsWith('.graphql'))) {
    check(readFileSync(`../react-client/src/queries/${file}`, 'utf8'), { pagination: { take: 100 }, filters: {} });
  }
  check('{ lcaDisclosures { stats { totalCount successPercentage } } }');
  assert.deepEqual(paginationBounds(null), { take: 20, skip: 0 });
});
test('variables, defaults, literal arguments, aliases and fragments cannot bypass limits', () => {
  for (const source of [
    '{lcaDisclosures{items(pagination:{take:0}){caseNumber}}}',
    '{lcaDisclosures{items(pagination:{take:101}){caseNumber}}}',
    '{lcaDisclosures{items(pagination:{skip:-1}){caseNumber}}}',
    'query($p:PaginationInput={take:101}){lcaDisclosures{items(pagination:$p){caseNumber}}}',
    '{lcaDisclosures{stats(filters:{employerUuid:["invalid"]}){totalCount}}}',
    `{uniqueColumnValues{employers(employerNameSearchStr:"${'a'.repeat(201)}"){hasNext}}}`,
    `{lcaDisclosures{${Array.from({length:11}, (_,i)=>`a${i}:stats{totalCount}`).join(' ')}}}`,
    '{...A ...A ...A} fragment A on Query {...B ...B} fragment B on Query {...C ...C} fragment C on Query {lcaDisclosures{stats{totalCount}}}',
  ]) assert.throws(() => check(source), source);
  assert.throws(() => check('query($f:LCADisclosureFilters){lcaDisclosures{stats(filters:$f){totalCount}}}', { f: { jobTitle: Array(51).fill('Engineer') } }));
});
test('HTTP protections reject before DB access; cached documents revalidate variables; proxy spoofing fails', async () => {
  let accesses = 0;
  const apollo = new ApolloServer({ schema, plugins: [protectionPlugin], parseOptions: {maxTokens: LIMITS.tokens}, allowBatchedHttpRequests: false });
  await apollo.start();
  const app = createHttpApp(1);
  app.use(expressMiddleware(apollo, { context: async () => ({ prisma: new Proxy({}, {get(){accesses++;throw new Error('DB accessed');}}) }) }));
  const http = createServer(app); await new Promise<void>(r=>http.listen(0,'127.0.0.1',r));
  const port = (http.address() as any).port;
  const post = (body: unknown, forwarded='198.51.100.1') => fetch(`http://127.0.0.1:${port}`, {method:'POST', headers:{'content-type':'application/json','x-forwarded-for':forwarded}, body:JSON.stringify(body)});
  try {
    const query = 'query($p:PaginationInput){lcaDisclosures{items(pagination:$p){caseNumber}}}';
    for (const take of [101, -1, 0]) assert.equal((await post({query,variables:{p:{take}}})).status,400);
    assert.equal((await post([{query:'{__typename}'}])).status,400);
    assert.equal((await post({query:'{__typename}',extra:'x'.repeat(33000)})).status,413);
    assert.equal((await post({query:'{'+ '__typename '.repeat(2100)+'}'})).status,400);
    const fragmentQuery='{...A ...A ...A} fragment A on Query {...B ...B} fragment B on Query {...C ...C} fragment C on Query {lcaDisclosures{stats{totalCount}}}';
    assert.equal((await post({query:fragmentQuery})).status,400);
    for(let i=0;i<30;i++) assert.equal((await post({query:'{__typename}'},`203.0.113.${i+1}, 198.51.100.2`)).status,200);
    const limited=await post({query:'{__typename}'},'203.0.113.222, 198.51.100.2');
    assert.equal(limited.status,429);assert.ok(limited.headers.get('retry-after'));
    assert.equal((await post({query:'{__typename}'},'198.51.100.3')).status,200);
    assert.equal(accesses,0);
  } finally {await apollo.stop();http.closeAllConnections();await new Promise<void>(r=>http.close(()=>r()));}
});
test('Postgres cancels statements on pooled Prisma connections', {skip: !process.env.TEST_DATABASE_URL}, async () => {
  const p = new PrismaClient({datasources:{db:{url:limitedDatabaseUrl(process.env.TEST_DATABASE_URL!,100)}}});
  try {
    await Promise.all(Array.from({length:3},async()=>{
      const [row] = await p.$queryRaw<{statement_timeout:string}[]>`SHOW statement_timeout`;
      assert.equal(row.statement_timeout,'100ms');
      await assert.rejects(p.$queryRaw`SELECT pg_sleep(1)`, (e:any)=>e.meta?.code==='57014');
    }));
    assert.deepEqual(await p.$queryRaw`SELECT 1 AS ok`,[{ok:1}]);
  } finally {await p.$disconnect();}
});
