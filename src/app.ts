import "reflect-metadata";
import path from "path";
import Koa, { Context } from "koa";
import jwt from "koa-jwt";
import serve from "koa-static";
import { ApolloServer } from "apollo-server-koa";

import { buildSchemaSync } from "type-graphql";

import User from "./modules/user/user.entity";
import { authChecker } from "./security/authChecker";
import { log, DEBUG, ERROR } from "./logging/logger";
import { bootstrap } from "./bootstrap";

const {
  NODE_ENV = "development",
  PORT = 5000,
  APP_KEY = "super secret"
} = process.env;

const GRAPHQL_PATH = "/graphql";

const schema = buildSchemaSync({
  resolvers: [`${__dirname}/**/*.resolver.ts`],
  authChecker,
  dateScalarMode: "timestamp"
});

const app = new Koa();

// Setup JWT authentication for everything
app.use(jwt({ secret: APP_KEY, passthrough: true }));

// Static files
app.use(serve(path.join(__dirname, "..", "public")));

const server = new ApolloServer({
  schema,
  context: ({ ctx }: { ctx: Context & { user: User } }) => {
    return { ctx, user: ctx.state.user };
  },
  playground: NODE_ENV === "development"
});

// Apply GraphQL middleware to the express app
server.applyMiddleware({ app, path: GRAPHQL_PATH });

(async () => {
  try {
    // Setup DB connection
    await bootstrap();

    app.listen({ port: PORT }, () => {
      log(
        DEBUG,
        `App listening on http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (err) {
    console.log(err);
    log(ERROR, "Error starting server:");
    log(ERROR, err);
    process.exit(-1);
  }
})();
