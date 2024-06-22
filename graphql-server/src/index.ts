import { schema } from "./schema";
import { context } from "./context";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

async function startApolloServer() {
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginCacheControl({
        // Cache everything for 1 second by default.
        defaultMaxAge: 3600 * 6, // 6 hours
        // Don't send the `cache-control` response header.
        calculateHttpHeaders: true,
      }),
    ],
  });
  const { url } = await startStandaloneServer(server, {
    context: async () => context,
    listen: { port: 4000 },
  });
  console.log(`🚀 Server ready at ${url}`);
}

startApolloServer();
