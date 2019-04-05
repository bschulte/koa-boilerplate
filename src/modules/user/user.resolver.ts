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
import { Logger } from "../../logging/Logger";
import { roles } from "../../common/constants";
import UserAccess from "../user-access/user-access.entity";
import UserConfig from "../user-config/user-config.entity";
import { Inject } from "typedi";
import { UserService } from "./user.service";
import { UserConfigService } from "../user-config/user-config.service";
import { UserAccessService } from "../user-access/user-access.service";

@Resolver(User)
export class UserResolver {
  private logger = new Logger(UserResolver.name);
  @Inject() private userService: UserService;
  @Inject() private userConfigService: UserConfigService;
  @Inject() private userAccessService: UserAccessService;

  @Query(() => User)
  @Authorized()
  public async user(@Ctx() ctx: any) {
    return this.userService.findOneById(ctx.user.id);
  }

  @Query(() => [User])
  @Authorized([roles.ADMIN])
  public async users() {
    return this.userService.findAll();
  }

  @Mutation(() => String)
  @Authorized([roles.ADMIN])
  public async createUser(@Arg("newUserData") newUserData: UserInput) {
    // Check if user with the given email exists already
    const user = await this.userService.findOneByEmail(newUserData.email);

    if (user) {
      this.logger.warn(`User already exists with email: ${newUserData.email}`);
      throw new Error("User exists already");
    }

    return await this.userService.create(newUserData.email);
  }

  @Mutation(() => String)
  public async login(@Arg("userData") { email, password }: UserInput) {
    return await this.userService.login(email, password);
  }

  @Mutation(() => Boolean)
  @Authorized([roles.ADMIN])
  public async changePassword(
    @Arg("email") email: string,
    @Arg("newPass") newPass: string
  ) {
    await this.userService.changePassword(email, newPass);
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

    return await this.userService.getImpersonationToken(email);
  }

  @Mutation(() => Boolean)
  @Authorized([roles.ADMIN])
  public async deleteUser(@Arg("userId") userId: number) {
    await this.userService.remove(userId);
    return true;
  }

  @FieldResolver(() => UserAccess)
  public async access(@Root() user: User) {
    return await this.userAccessService.findOneById(user.accessId);
  }

  @FieldResolver(() => UserConfig)
  public async config(@Root() user: User) {
    return await this.userConfigService.findOneById(user.configId);
  }
}
