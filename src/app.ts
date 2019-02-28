import "reflect-metadata";
import path from "path";
import Koa from "koa";
import jwt from "koa-jwt";
import serve from "koa-static";
import { ApolloServer, Request } from "apollo-server-koa";

import { buildSchemaSync } from "type-graphql";
import { Sequelize } from "sequelize-typescript";

import dotenv from "dotenv";
dotenv.config();

import User from "./modules/user/user.model";
import { authChecker } from "./security/authChecker";
import { log, DEBUG, ERROR } from "./logging/logger";

const {
  NODE_ENV = "development",
  PORT = 5000,
  APP_KEY = "super secret",
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASS
} = process.env;

const GRAPHQL_PATH = "/graphql";

const schema = buildSchemaSync({
  resolvers: [`${__dirname}/**/*.resolver.ts`],
  authChecker,
  dateScalarMode: "timestamp"
});

const app = new Koa();

// Setup JWT authentication for everything
app.use(jwt({ secret: APP_KEY }).unless({ path: [/^\/public/] }));

// Static files for the React app
app.use(serve(path.join(__dirname, "..", "public")));

const server = new ApolloServer({
  schema,
  context: ({ req }: { req: Request & { user: User } }) => {
    return { req, user: req.user };
  },
  playground: NODE_ENV === "development"
});

// Apply GraphQL middleware to the express app
server.applyMiddleware({ app, path: GRAPHQL_PATH });

(async () => {
  try {
    // Setup DB connection
    const sequelize = new Sequelize({
      dialect: "mysql",
      host: DB_HOST,
      database: DB_NAME,
      username: DB_USER,
      password: DB_PASS,
      modelPaths: [__dirname + "/**/*.model.ts"]
    });

    await sequelize.sync({
      alter: NODE_ENV === "development"
    });

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
