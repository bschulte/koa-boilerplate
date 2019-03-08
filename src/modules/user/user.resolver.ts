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
import jwt from "jsonwebtoken";

import User from "./user.entity";
import { UserInput } from "./dtos/UserInput";
import { userService } from "./user.service";
import { comparePasswords } from "../../security/authentication";
import { Logger, WARN, ERROR } from "../../logging/Logger";
import { roles } from "../../common/constants";
import { userAccessService } from "../user-access/user-access.service";
import { userConfigService } from "../user-config/user-config.service";
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
      this.logger.log(
        WARN,
        "User already exists with email:",
        newUserData.email
      );
      throw new Error("User exists already");
    }

    return await userService.create(newUserData.email);
  }

  @Mutation(() => String)
  public async login(@Arg("userData") { email, password }: UserInput) {
    const user = await userService.findOneByEmail(email);
    // Check if the user exists
    if (!user) {
      this.logger.log(ERROR, "Could not find user for email:", email);
      throw new Error("Could not find user");
    }

    // Check if the password is correct
    if (!comparePasswords(password, user.password)) {
      this.logger.log(ERROR, "Invalid password entered for user:", email);
      throw new Error("Invalid password");
    }

    return jwt.sign(
      { email, id: user.id },
      process.env.APP_KEY || "super secret",
      {
        expiresIn: "2d"
      }
    );
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
