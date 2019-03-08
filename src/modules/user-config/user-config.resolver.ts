import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import UserConfig from "./user-config.entity";
import { userConfigService } from "./user-config.service";
import { roles } from "../../common/constants";
import { log, DEBUG, INFO } from "../../logging/logger";

@Resolver(UserConfig)
export class UserConfigResolver {
  @Query(() => UserConfig)
  @Authorized()
  public async userConfig(@Ctx() ctx: any, @Arg("id") id: number) {
    return await userConfigService.findOneById(id);
  }

  @Mutation(() => UserConfig)
  @Authorized([roles.ADMIN])
  public async updateUserConfig(
    @Arg("userConfigId") userConfigId: number,
    @Arg("key") key: string,
    @Arg("value") value: string
  ) {
    log(INFO, `Updating user config key: ${key} to value: ${value}`);
    return await userConfigService.update(userConfigId, key, value);
  }
}
