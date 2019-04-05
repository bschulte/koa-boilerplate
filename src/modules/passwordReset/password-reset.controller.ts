import * as passwordResetService from "./password-reset.service";
import { Context } from "koa";
import {
  JsonController,
  Post,
  BodyParam,
  Ctx,
  Patch
} from "routing-controllers";
import { StatusCode } from "../../common/constants";
import { Logger } from "../../logging/Logger";

@JsonController("/password-reset")
export class PasswordResetController {
  private logger = new Logger(PasswordResetController.name);

  @Post("/")
  public async createPasswordResetToken(
    @BodyParam("email") email: string,
    @Ctx() ctx: Context
  ) {
    this.logger.debug(`Creating password reset token for user: ${email}`);
    await passwordResetService.createPasswordResetToken(email);

    ctx.status = StatusCode.ACCEPTED;
    return { success: true };
  }

  @Patch("/")
  public async resetPassword(
    @BodyParam("email") email: string,
    @BodyParam("token") token: string,
    @BodyParam("newPassword") newPassword: string,
    @BodyParam("newPasswordDupe") newPasswordDupe: string,
    @Ctx() ctx: Context
  ) {
    await passwordResetService.resetPassword(
      email,
      token,
      newPassword,
      newPasswordDupe
    );

    ctx.status = StatusCode.ACCEPTED;
    return { success: true };
  }
}
