import { ApolloServer } from "apollo-server-koa";
import { buildSchemaSync } from "type-graphql";
import { createTestClient } from "apollo-server-testing";

import { authChecker } from "../../security/auth-checker";
import { Context } from "mocha";
import User from "../../modules/user/user.entity";
import * as userService from "../../modules/user/user.service";

export default async () => {
  const schema = buildSchemaSync({
    resolvers: [`${__dirname}/../../**/*.resolver.ts`],
    authChecker,
    dateScalarMode: "timestamp"
  });

  const server = new ApolloServer({
    schema,
    context: async ({ ctx }: { ctx: Context & { user: User } }) => {
      if (ctx.state.user) {
        const user = await userService.findOneById(ctx.state.user.id);
        return { ctx, user };
      }
      return { ctx, user: null };
    }
  });

  return await createTestClient(server);
};
