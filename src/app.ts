import "reflect-metadata";
import path from "path";
import Koa, { Context } from "koa";
import bodyParser from "koa-bodyparser";
import jwt from "koa-jwt";
import serve from "koa-static";
import morgan from "koa-morgan";
import als from "async-local-storage";
import { v4 as uuid } from "uuid";
import { ApolloServer } from "apollo-server-koa";

import { buildSchemaSync } from "type-graphql";

import User from "./modules/user/user.entity";
import { authChecker } from "./security/auth-checker";
import { Logger } from "./logging/Logger";
import { bootstrap } from "./bootstrap";
import { userService } from "./modules/user/user.service";
import { isDevEnv } from "./common/helpers/util";
import { passwordResetRouter } from "./modules/passwordReset/password-reset.controller";

const { PORT = 5000, APP_KEY = "super secret" } = process.env;

const GRAPHQL_PATH = "/graphql";

(async () => {
  const logger = new Logger("App.ts");

  const schema = buildSchemaSync({
    resolvers: [`${__dirname}/**/*.resolver.ts`],
    authChecker,
    dateScalarMode: "timestamp"
  });

  // Create the server with the routing controllers function in
  // order to feed in all our controllers
  const app = new Koa();
  app.use(bodyParser());

  // Global exception handler
  app.use(async (ctx: Context, next: any) => {
    try {
      await next();
    } catch (err) {
      ctx.throw(err.message, err.status);
    }
  });

  // Enable the async local storage for the application
  als.enable();

  // Set the unique identifier for each request
  app.use(async (ctx: Context, next: any) => {
    const requestId = ctx.request.headers["x-request-id"] || uuid();
    als.set("requestId", requestId.replace("-", "").slice(0, 12));

    await next();
  });

  // Setup JWT authentication for everything
  // Also set the logged in user in async local storage
  app.use(jwt({ secret: APP_KEY, passthrough: true }));
  app.use(async (ctx: Context, next: any) => {
    if (ctx.state.user) {
      als.set("user", ctx.state.user.email);
    }

    await next();
  });

  // Static files
  app.use(serve(path.join(__dirname, "..", "public")));

  // Morgan logger for requests
  app.use(morgan("short", { stream: logger }));

  // Apollo server
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

  // Standard REST routes
  app.use(passwordResetRouter.routes());

  try {
    // Setup DB connection
    await bootstrap();

    app.listen({ port: PORT }, () => {
      logger.info(
        `App listening on http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (err) {
    logger.error("Error starting server:");
    logger.error(err);
    process.exit(-1);
  }
})();
