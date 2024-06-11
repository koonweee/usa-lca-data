import { schema } from "./schema";
import { context } from "./context";
import { ApolloServer } from "apollo-server";

async function startApolloServer() {
  const server = new ApolloServer({
    schema,
    context
  })
  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  });
}

startApolloServer()
