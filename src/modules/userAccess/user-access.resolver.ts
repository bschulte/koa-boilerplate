import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import UserAccess from "./user-access.entity";
import { userAccessService } from "./user-access.service";
import { ADMIN } from "../../security/auth-checker";

@Resolver(UserAccess)
export class UserAccessResolver {
  @Query(() => UserAccess)
  @Authorized()
  public async userAccess(@Ctx() ctx: any) {
    console.log("ctx:", ctx);
    return userAccessService.findOneById(ctx.user.id);
  }
}
