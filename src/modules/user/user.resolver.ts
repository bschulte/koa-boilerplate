import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Authorized,
  Ctx,
  FieldResolver,
  Root
} from "type-graphql";

import User from "./user.entity";
import { UserInput } from "./dtos/UserInput";
import * as userService from "./user.service";
import { Logger } from "../../logging/Logger";
import { roles } from "../../common/constants";
import * as userAccessService from "../user-access/user-access.service";
import * as userConfigService from "../user-config/user-config.service";
import UserAccess from "../user-access/user-access.entity";
import UserConfig from "../user-config/user-config.entity";

@Resolver(User)
export class UserResolver {
  private logger = new Logger(UserResolver.name);

  @Query(() => User)
  @Authorized()
  public async user(@Ctx() ctx: any) {
    return userService.findOneById(ctx.user.id);
  }

  @Query(() => [User])
  @Authorized([roles.ADMIN])
  public async users() {
    return userService.findAll();
  }

  @Mutation(() => String)
  @Authorized([roles.ADMIN])
  public async createUser(@Arg("newUserData") newUserData: UserInput) {
    // Check if user with the given email exists already
    const user = await userService.findOneByEmail(newUserData.email);

    if (user) {
      this.logger.warn(`User already exists with email: ${newUserData.email}`);
      throw new Error("User exists already");
    }

    return await userService.create(newUserData.email);
  }

  @Mutation(() => String)
  public async login(@Arg("userData") { email, password }: UserInput) {
    return await userService.login(email, password);
  }

  @Mutation(() => Boolean)
  @Authorized([roles.ADMIN])
  public async changePassword(
    @Arg("email") email: string,
    @Arg("newPass") newPass: string
  ) {
    await userService.changePassword(email, newPass);
    return true;
  }

  @Query(() => String)
  @Authorized([roles.ADMIN])
  public async getImpersonationToken(
    @Ctx() ctx: any,
    @Arg("email") email: string
  ) {
    this.logger.debug(
      `Admin user (${
        ctx.user.email
      }) requested impersonation token for user: ${email}`
    );

    return await userService.getImpersonationToken(email);
  }

  @Mutation(() => Boolean)
  @Authorized([roles.ADMIN])
  public async deleteUser(@Arg("userId") userId: number) {
    await userService.remove(userId);
    return true;
  }

  @FieldResolver(() => UserAccess)
  public async access(@Root() user: User) {
    return await userAccessService.findOneById(user.accessId);
  }

  @FieldResolver(() => UserConfig)
  public async config(@Root() user: User) {
    return await userConfigService.findOneById(user.configId);
  }
}
