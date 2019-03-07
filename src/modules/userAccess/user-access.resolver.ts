import { Resolver, Query, Authorized, Ctx } from "type-graphql";

import UserAccess from "./user-access.entity";
import { userAccessService } from "./user-access.service";

@Resolver(UserAccess)
export class UserAccessResolver {
  @Query(() => UserAccess)
  @Authorized()
  public async userAccess(@Ctx() ctx: any) {
    return userAccessService.findOneById(ctx.user.id);
  }
}
