import UserAccess from "./user-access.entity";
import { getRepository, Repository } from "typeorm";

class UserAccessService {
  public async findOneById(userAccessId: number): Promise<UserAccess> {
    return await this.repo().findOne(userAccessId);
  }

  public async delete(userAccessId: number) {
    return await this.repo().delete(userAccessId);
  }

  private repo(): Repository<UserAccess> {
    return getRepository(UserAccess);
  }
}

export const userAccessService = new UserAccessService();
