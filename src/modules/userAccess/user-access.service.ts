import UserAccess from "./user-access.entity";
import { getRepository, Repository } from "typeorm";

class UserAccessService {
  public async findOneById(userAccessId: number): Promise<UserAccess> {
    return await this.repo().findOne(userAccessId);
  }

  public async delete(userAccessId: number) {
    return await this.repo().delete(userAccessId);
  }

  public async update(userAccessId: number, key: string, value: boolean) {
    await this.repo().update({ id: userAccessId }, { [key]: value });
    return await this.findOneById(userAccessId);
  }

  public async save(userAccess: UserAccess) {
    return await this.repo().save(userAccess);
  }

  private repo(): Repository<UserAccess> {
    return getRepository(UserAccess);
  }
}

export const userAccessService = new UserAccessService();
