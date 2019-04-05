import { Service } from "typedi";
import { getRepository, Repository } from "typeorm";
import createError from "http-errors";

import UserAccess from "./user-access.entity";
import { StatusCode } from "../../common/constants";
import { OrmRepository } from "typeorm-typedi-extensions";

@Service()
export class UserAccessService {
  @OrmRepository(UserAccess) private repo: Repository<UserAccess>;

  public async findOneById(userAccessId: number) {
    return await this.repo.findOne(userAccessId);
  }

  public async remove(userAccessId: number) {
    return await this.repo.delete(userAccessId);
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
    return await this.repo.save(userAccess);
  }
}
