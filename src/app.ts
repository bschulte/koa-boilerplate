import "reflect-metadata";
import { buildSchemaSync } from "type-graphql";
import { Sequelize } from "sequelize-typescript";
import path from "path";
import express from "express";
import expressJwt from "express-jwt";
import { ApolloServer, Request } from "apollo-server-express";

import dotenv from "dotenv";
dotenv.config();

import { User } from "./modules/user/user.model";
import { authChecker } from "./security/authChecker";
import { log, DEBUG, ERROR } from "./logging/logger";

const {
  NODE_ENV = "development",
  PORT = 5000,
  APP_KEY = "super secret",
  DB_NAME,
  DB_USER,
  DB_PASS
} = process.env;

const GRAPHQL_PATH = "/graphql";

const schema = buildSchemaSync({
  resolvers: [`${__dirname}/resolvers/*.resolver.ts`],
  authChecker,
  dateScalarMode: "timestamp"
});

const app = express();

// Static files for the React app
app.use(express.static(path.join(__dirname, "..", "public")));

const server = new ApolloServer({
  schema,
  context: ({ req }: { req: Request & { user: User } }) => {
    return { req, user: req.user };
  },
  playground: NODE_ENV === "development"
});

// Use express-jwt middleware to validate a provided token
app.use(
  GRAPHQL_PATH,
  expressJwt({
    secret: APP_KEY,
    credentialsRequired: false
  })
);

// Apply GraphQL middleware to the express app
server.applyMiddleware({ app, path: GRAPHQL_PATH });

(async () => {
  try {
    // Setup DB connection
    const sequelize = new Sequelize({
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
