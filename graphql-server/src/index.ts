import { schema } from './schema';
import { context } from './context';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'http';
import { createHttpApp } from './http';
import { LIMITS, protectionPlugin } from './protection';

async function startApolloServer() {
  const app = createHttpApp(Number(process.env.TRUST_PROXY_HOPS ?? 0));
  const httpServer = createServer(app);
  httpServer.requestTimeout = 10000;
  httpServer.headersTimeout = 5000;
  const server = new ApolloServer({
    schema,
    allowBatchedHttpRequests: false,
    parseOptions: { maxTokens: LIMITS.tokens },
    plugins: [protectionPlugin, ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginCacheControl({ defaultMaxAge: 3600 * 6, calculateHttpHeaders: true })],
  });
  await server.start();
  app.use('/', expressMiddleware(server, { context: async () => context }));
  // Fail startup if a driver/configuration change silently drops the DB timeout.
  const timeout = await context.prisma.$queryRaw<{ statement_timeout: string }[]>`SHOW statement_timeout`;
  if (timeout[0]?.statement_timeout !== '5s') throw new Error('Database statement timeout is not active');
  await new Promise<void>(resolve => httpServer.listen(4000, resolve));
  console.log('GraphQL ready on port 4000; database statement timeout 5s');
}
startApolloServer().catch(() => { console.error('GraphQL startup failed'); process.exit(1); });
