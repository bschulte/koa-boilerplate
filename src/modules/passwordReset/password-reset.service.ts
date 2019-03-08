import * as bcrypt from "bcrypt";
import moment from "moment";
import * as owasp from "owasp-password-strength-test";
import createError from "http-errors";

import {
  EMAIL_FROM,
  PASSWORD_RESET_SNIPPET,
  StatusCode
} from "../../common/constants";
import { Logger, DEBUG, INFO, WARN } from "../../logging/Logger";
import User from "../user/user.entity";
import { userService } from "../user/user.service";
import { emailerService } from "../emailer/emailer.service";
import { randomStr } from "../../common/helpers/util";

class PasswordResetService {
  private logger = new Logger(PasswordResetService.name);

  public async createPasswordResetToken(email: string) {
    this.logger.info(`Password reset requested for email: ${email}`);
    const user = await userService.findOneByEmail(email);
    if (!user) {
      this.logger.warn(
        `Password reset requested for email that does not exist: ${email}`
      );
      return;
    }

    const token = randomStr(36);

    user.resetToken = bcrypt.hashSync(token, 10);
    user.resetTokenExpires = moment()
      .add(2, "hour")
      .toDate();
    await userService.save(user);

    await this.sendPasswordResetEmail(user, token);

    return true;
  }

  public async resetPassword(
    email: string,
    token: string,
    newPassword: string,
    newPasswordDupe: string
  ) {
    const user: User = await userService.findOneByEmail(email);
    this.logger.info(`Attempting to reset password for: ${user.email}`);
    if (!user) {
      this.logger.warn("Invalid token provided for password reset");
      throw createError(StatusCode.UNAUTHORIZED, "Invalid token");
    }
    if (!user.resetToken) {
      this.logger.warn(
        `User does not have password reset token: ${user.email}`
      );
      throw createError(StatusCode.UNAUTHORIZED, "Invalid token");
    }

    // Check if the token has expired
    this.validateToken(token, user);

    // Check if the new password and its repeated value are the same
    this.validateSamePassword(newPassword, newPasswordDupe, user);

    // Check new password strength
    this.validatePasswordStrength(newPassword, user);

    // Update the password
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await userService.save(user);

    this.logger.debug(`Reset password successfully for user: ${user.email}`);

    return true;
  }

  private validatePasswordStrength(newPassword: string, user: User) {
    const passTestResult = owasp.test(newPassword);
    if (!passTestResult.strong) {
      this.logger.warn(
        `Non-strong password entered for new password, user: ${user.email}`
      );
      throw createError(
        StatusCode.BAD_REQUEST,
        `Invalid new password, errors: ${passTestResult.errors.join(" ")}`
      );
    }
  }

  private validateSamePassword(
    newPassword: string,
    newPasswordDupe: string,
    user: User
  ) {
    if (newPassword !== newPasswordDupe) {
      this.logger.warn(
        `Passwords do not match for password reset, user: ${user.email}`
      );
      throw createError(StatusCode.BAD_REQUEST, "Passwords do not match");
    }
  }

  private validateToken(token: string, user: User) {
    const isCorrectToken = bcrypt.compareSync(token, user.resetToken);
    if (!isCorrectToken) {
      this.logger.warn(
        `User entered invalid token for password reset: ${user.email}`
      );
      throw createError(StatusCode.BAD_REQUEST, "Invalid token");
    }

    const timeDiff = moment(user.resetTokenExpires).diff(moment(), "second");
    if (timeDiff < 0) {
      this.logger.warn(`Token has expired for user: ${user.email}`);
      throw createError(StatusCode.BAD_REQUEST, "Expired token");
    }
  }

  private async sendPasswordResetEmail(user: User, generatedToken: string) {
    await emailerService.send({
      subject: "[Kryptowire EMM] Password Reset",
      to: [user.email],
      from: EMAIL_FROM,
      snippet: PASSWORD_RESET_SNIPPET,
      params: {
        token: generatedToken
      }
    });
  }
}

export const passwordResetService = new PasswordResetService();
