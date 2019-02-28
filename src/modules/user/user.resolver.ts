import { Resolver, Query, Arg, Mutation, Authorized, Ctx } from "type-graphql";
import jwt from "jsonwebtoken";

import User from "./user.model";
import { UserInput } from "./dtos/UserInput";
import { userService } from "./user.service";
import { comparePasswords, hashString } from "../../security/authentication";
import { ADMIN } from "../../security/authChecker";

@Resolver(User)
export class UserResolver {
  @Query(() => User)
  public async user(@Ctx() ctx: any) {
    return userService.findOneById(ctx.user.id);
  }

  @Mutation(() => User)
  @Authorized([ADMIN])
  public async createUser(@Arg("newUserData") newUserData: UserInput) {
    // Check if user with the given email exists already
    const user = await userService.findOneByEmail(newUserData.email);
    if (user) {
      console.log("User already exists with email:", newUserData.email);
      throw new Error("User exists already");
    }

    newUserData.password = hashString(newUserData.password);

    return await userService.create(newUserData);
  }

  @Mutation(() => String)
  public async login(@Arg("userData") { email, password }: UserInput) {
    const user = await userService.findOneByEmail(email);
    // Check if the user exists
    if (!user) {
      console.log("Could not find user for email:", email);
      throw new Error("Could not find user");
    }

    // Check if the password is correct
    if (!comparePasswords(password, user.password)) {
      console.log("Invalid password entered for user:", email);
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
}
