import UserAccess from "./userAccess.entity";
import { getRepository } from "typeorm";

class UserAccessService {
  public async findOneById(userAccessId: number): Promise<UserAccess> {
    return await getRepository(UserAccess).findOne(userAccessId);
  }
}

export const userAccessService = new UserAccessService();
