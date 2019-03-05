import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import UserAccess from "./userAccess.model";
import { userAccessService } from "./userAccess.service";
import { ADMIN } from "../../security/authChecker";

@Resolver(UserAccess)
export class UserAccessResolver {
  @Query(() => UserAccess)
  @Authorized()
  public async userAccess(@Ctx() ctx: any) {
    console.log("ctx:", ctx);
    return userAccessService.findOneById(ctx.user.id);
  }
}