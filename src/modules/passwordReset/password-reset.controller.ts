import * as passwordResetService from "./password-reset.service";
import Router from "koa-router";
import { Context } from "koa";
import { StatusCode } from "../../common/constants";

const router = new Router();

router.prefix("/password-reset");

router.post("/", async (ctx: Context, next: any) => {
  const { email } = ctx.request.body;

  await passwordResetService.createPasswordResetToken(email);
  ctx.status = StatusCode.ACCEPTED;
});

router.patch("/", async (ctx: Context, next: any) => {
  const { newPassword, newPasswordDupe, token, email } = ctx.request.body;
  await passwordResetService.resetPassword(
    email,
    token,
    newPassword,
    newPasswordDupe
  );

  ctx.status = StatusCode.ACCEPTED;
});

export const passwordResetRouter = router;
