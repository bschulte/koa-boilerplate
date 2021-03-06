import { Context } from "koa";
import {
  JsonController,
  Post,
  BodyParam,
  Ctx,
  Patch,
  QueryParam,
  Get
} from "routing-controllers";
import { Inject } from "typedi";

import { UserService } from "./user.service";
import { Logger } from "../../logging/Logger";

@JsonController("/user")
export class UserController {
  private logger = new Logger(UserController.name);
  @Inject() private userService: UserService;

  @Post("/")
  public async createUser(
    @BodyParam("email") email: string,
    @BodyParam("password") password: string
  ) {
    this.logger.debug(`Creating new user: ${email}`);
    await this.userService.create(email, password);

    return { success: true };
  }

  @Get("/verify-email")
  public async verifyEmail(@QueryParam("token") token: string) {
    await this.userService.verifyEmailToken(token);

    return { success: true };
  }
}
