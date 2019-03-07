import UserConfig from "./user-config.entity";
import { getRepository, Repository } from "typeorm";

class UserConfigService {
  public async findOneById(userConfigId: number): Promise<UserConfig> {
    return await this.repo().findOne(userConfigId);
  }

  public async delete(userConfigId: number) {
    await this.repo().delete(userConfigId);
  }

  private repo(): Repository<UserConfig> {
    return getRepository(UserConfig);
  }
}

export const userConfigService = new UserConfigService();
