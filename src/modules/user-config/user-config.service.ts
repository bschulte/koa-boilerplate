import UserConfig from "./user-config.entity";
import { getRepository, Repository } from "typeorm";
import createError from "http-errors";
import { StatusCode } from "../../common/constants";

class UserConfigService {
  public async findOneById(userConfigId: number): Promise<UserConfig> {
    return await this.repo().findOne(userConfigId);
  }

  public async update(userConfigId: number, key: string, value: any) {
    const userConfig = await this.findOneById(userConfigId);
    if (!userConfig) {
      throw createError(
        StatusCode.BAD_REQUEST,
        "Could not find user config entry"
      );
    }

    if (!(key in userConfig)) {
      throw createError(
        StatusCode.BAD_REQUEST,
        `Invalid user config key: ${key}`
      );
    }

    userConfig[key] = value;
    await this.save(userConfig);

    return userConfig;
  }

  public async delete(userConfigId: number) {
    await this.repo().delete(userConfigId);
  }

  public async save(userConfig: UserConfig) {
    await this.repo().save(userConfig);
  }

  private repo(): Repository<UserConfig> {
    return getRepository(UserConfig);
  }
}

export const userConfigService = new UserConfigService();
