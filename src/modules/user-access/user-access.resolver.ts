import { Resolver, Authorized, Mutation, Arg } from "type-graphql";
import { Inject } from "typedi";

import UserAccess from "./user-access.entity";
import { roles } from "../../common/constants";
import { UserAccessService } from "./user-access.service";

@Resolver(UserAccess)
export class UserAccessResolver {
  @Inject() private userAccessService: UserAccessService;

  @Mutation(() => UserAccess)
  @Authorized([roles.ADMIN])
  public async updateUserAccess(
    @Arg("userAccessId") userAccessId: number,
    @Arg("key") key: string,
    @Arg("value") value: boolean
  ) {
    return await this.userAccessService.update(userAccessId, key, value);
  }
}
