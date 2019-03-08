import UserAccess from "./user-access.entity";
import { getRepository, Repository } from "typeorm";
import createError from "http-errors";
import { StatusCode } from "../../common/constants";

class UserAccessService {
  public async findOneById(userAccessId: number): Promise<UserAccess> {
    return await this.repo().findOne(userAccessId);
  }

  public async delete(userAccessId: number) {
    return await this.repo().delete(userAccessId);
  }

  public async update(userAccessId: number, key: string, value: boolean) {
    const userAccess = await this.findOneById(userAccessId);
    if (!userAccess) {
      throw createError(
        StatusCode.BAD_REQUEST,
        "Could not find user access entry"
      );
    }

    if (!(key in userAccess)) {
      throw createError(
        StatusCode.BAD_REQUEST,
        `Invalid user access key: ${key}`
      );
    }

    userAccess[key] = value;
    await this.save(userAccess);

    return userAccess;
  }

  public async save(userAccess: UserAccess) {
    return await this.repo().save(userAccess);
  }

  private repo(): Repository<UserAccess> {
    return getRepository(UserAccess);
  }
}

export const userAccessService = new UserAccessService();
