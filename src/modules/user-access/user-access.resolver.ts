import { Resolver, Authorized, Mutation, Arg } from "type-graphql";

import UserAccess from "./user-access.entity";
import { userAccessService } from "./user-access.service";
import { roles } from "../../common/constants";

@Resolver(UserAccess)
export class UserAccessResolver {
  @Mutation(() => UserAccess)
  @Authorized([roles.ADMIN])
  public async updateUserAccess(
    @Arg("userAccessId") userAccessId: number,
    @Arg("key") key: string,
    @Arg("value") value: boolean
  ) {
    return await userAccessService.update(userAccessId, key, value);
  }
}
