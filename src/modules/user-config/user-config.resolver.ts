import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import UserConfig from "./user-config.entity";
import { userConfigService } from "./user-config.service";

@Resolver(UserConfig)
export class UserConfigResolver {
  @Query(() => UserConfig)
  @Authorized()
  public async userConfig(@Ctx() ctx: any, @Arg("id") id: number) {
    return userConfigService.findOneById(id);
  }
}
