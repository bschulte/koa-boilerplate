import { CreateResetDto } from "./dtos/createReset.dto";
import { passwordResetService } from "./password-reset.service";
import { ResetDto } from "./dtos/reset.dto";
import { JsonController, Post, Patch, Body } from "routing-controllers";

@JsonController("/password-reset")
export class PasswordResetController {
  @Post()
  public async createPasswordReset(@Body()
  {
    email
  }: CreateResetDto) {
    return await passwordResetService.createPasswordResetToken(email);
  }

  @Patch()
  public async resetPassword(@Body()
  {
    newPassword,
    newPasswordDupe,
    token,
    email
  }: ResetDto) {
    return await passwordResetService.resetPassword(
      email,
      token,
      newPassword,
      newPasswordDupe
    );
  }
}
