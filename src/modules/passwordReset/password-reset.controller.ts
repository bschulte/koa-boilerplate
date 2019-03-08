import { CreateResetDto } from "./dtos/createReset.dto";
import { passwordResetService } from "./password-reset.service";
import { ResetDto } from "./dtos/reset.dto";
import Router from "koa-router";
import { Context } from "koa";

const router = new Router();

router.prefix("/password-reset");

router.post("/", async (ctx: Context, next: any) => {
  const { email } = ctx.request.body;
  return await passwordResetService.createPasswordResetToken(email);
});

router.patch("/", async (ctx: Context, next: any) => {
  const { newPassword, newPasswordDupe, token, email } = ctx.request.body;
  return await passwordResetService.resetPassword(
    email,
    token,
    newPassword,
    newPasswordDupe
  );
});

export const passwordResetRouter = router;
