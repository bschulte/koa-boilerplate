import UserConfig from "./user-config.entity";
import { Repository } from "typeorm";
import createError from "http-errors";
import { StatusCode } from "../../common/constants";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";

@Service()
export class UserConfigService {
  @OrmRepository(UserConfig) private repo: Repository<UserConfig>;

  public async findOneById(userConfigId: number) {
    return await this.repo.findOne(userConfigId);
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

  public async remove(userConfigId: number) {
    await this.repo.delete(userConfigId);
  }

  public async save(userConfig: UserConfig) {
    return await this.repo.save(userConfig);
  }
}
