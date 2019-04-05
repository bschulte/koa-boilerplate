import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";

import UserConfig from "./user-config.entity";
import { roles } from "../../common/constants";
import { Logger } from "../../logging/Logger";
import { Inject } from "typedi";
import { UserConfigService } from "./user-config.service";

@Resolver(UserConfig)
export class UserConfigResolver {
  private logger = new Logger(UserConfigResolver.name);
  @Inject() private userConfigService: UserConfigService;

  @Mutation(() => UserConfig)
  @Authorized([roles.ADMIN])
  public async updateUserConfig(
    @Arg("userConfigId") userConfigId: number,
    @Arg("key") key: string,
    @Arg("value") value: string
  ) {
    this.logger.info(`Updating user config key: ${key} to value: ${value}`);
    return await this.userConfigService.update(userConfigId, key, value);
  }
}
