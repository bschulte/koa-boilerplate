import UserAccess from "./userAccess.model";

class UserAccessService {
  public async findOneById(userAccessId: number): Promise<UserAccess> {
    return await UserAccess.findOne({ where: { id: userAccessId } });
  }
}

export const userAccessService = new UserAccessService();
