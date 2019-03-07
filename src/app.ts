import "reflect-metadata";
import path from "path";
import { Context } from "koa";
import jwt from "koa-jwt";
import serve from "koa-static";
import { ApolloServer } from "apollo-server-koa";

import { buildSchemaSync } from "type-graphql";

import User from "./modules/user/user.entity";
import { authChecker } from "./security/auth-checker";
import { log, DEBUG, ERROR } from "./logging/logger";
import { bootstrap } from "./bootstrap";
import { userService } from "./modules/user/user.service";
import { isDevEnv } from "./common/util";
import { createKoaServer } from "routing-controllers";
import { UserController } from "./modules/user/user.controller";

const { PORT = 5000, APP_KEY = "super secret" } = process.env;

const GRAPHQL_PATH = "/graphql";

(async () => {
  const schema = buildSchemaSync({
    resolvers: [`${__dirname}/**/*.resolver.ts`],
    authChecker,
    dateScalarMode: "timestamp"
  });

  const app = createKoaServer({
    controllers: [UserController]
  });

  // Setup JWT authentication for everything
  app.use(jwt({ secret: APP_KEY, passthrough: true }));

  // Static files
  app.use(serve(path.join(__dirname, "..", "public")));

  const server = new ApolloServer({
    schema,
    context: async ({ ctx }: { ctx: Context & { user: User } }) => {
      if (ctx.state.user) {
        const user = await userService.findOneById(ctx.state.user.id);
        return { ctx, user };
      }
      return { ctx, user: null };
    },
    playground: isDevEnv()
  });

  // Apply GraphQL middleware to the express app
  server.applyMiddleware({ app, path: GRAPHQL_PATH });

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
