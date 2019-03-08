import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import UserConfig from "./user-config.entity";
import { userConfigService } from "./user-config.service";
import { roles } from "../../common/constants";
import { Logger } from "../../logging/Logger";

@Resolver(UserConfig)
export class UserConfigResolver {
  private logger = new Logger(UserConfigResolver.name);

  @Mutation(() => UserConfig)
  @Authorized([roles.ADMIN])
  public async updateUserConfig(
    @Arg("userConfigId") userConfigId: number,
    @Arg("key") key: string,
    @Arg("value") value: string
  ) {
    this.logger.info(`Updating user config key: ${key} to value: ${value}`);
    return await userConfigService.update(userConfigId, key, value);
  }
}
