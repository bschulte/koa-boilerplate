import { ApolloServer } from "apollo-server-koa";
import { buildSchemaSync } from "type-graphql";
import { createTestClient } from "apollo-server-testing";

import { Context } from "mocha";
import User from "../../modules/user/user.entity";
import { authChecker } from "../../security/auth-checker";

export default async () => {
  const schema = buildSchemaSync({
    resolvers: [`${__dirname}/../../**/*.resolver.ts`],
    authChecker,
    dateScalarMode: "timestamp"
  });

  const server = new ApolloServer({
    schema,
    context: async ({ ctx }: { ctx: Context & { user: User } }) => ({
      ctx,
      user: { id: 1, email: "test@test.com" }
    })
  });

  return await createTestClient(server);
};
