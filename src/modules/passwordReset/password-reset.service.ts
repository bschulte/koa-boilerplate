import * as bcrypt from "bcrypt";
import moment from "moment";
import * as owasp from "owasp-password-strength-test";

import { EMAIL_FROM, PASSWORD_RESET_SNIPPET } from "../../common/constants";

import { log, DEBUG, INFO, WARN } from "../../logging/logger";
import User from "../user/user.entity";
import { userService } from "../user/user.service";
import { emailerService } from "../emailer/emailer.service";
import { randomStr } from "../../common/helpers/util";

class PasswordResetService {
  public async createPasswordResetToken(email: string) {
    log(INFO, `Password reset requested for email: ${email}`);
    const user = await userService.findOneByEmail(email);
    if (!user) {
      log(
        WARN,
        `Password reset requested for email that does not exist: ${email}`
      );
      return;
    }

    const token = randomStr(36);

    log(DEBUG, `Token created: ${token}`);

    user.resetToken = bcrypt.hashSync(token, 10);
    user.resetTokenExpires = moment()
      .add(2, "hour")
      .toDate();
    await userService.save(user);

    await this.sendPasswordResetEmail(user, token);

    return;
  }

  public async resetPassword(
    email: string,
    token: string,
    newPassword: string,
    newPasswordDupe: string
  ) {
    const user: User = await userService.findOneByEmail(email);
    log(INFO, `Attempting to reset password for: ${user.email}`);
    if (!user) {
      log(WARN, "Invalid token provided for password reset");
      // TODO: Convert to HTTP Exception
      throw new Error("Invalid token");
    }
    if (!user.resetToken) {
      log(WARN, `User does not have password reset token: ${user.email}`);
      // TODO: Convert to HTTP Exception
      throw new Error("Invalid token");
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

    log(DEBUG, `Reset password successfully for user: ${user.email}`);
  }

  private validatePasswordStrength(newPassword: string, user: User) {
    const passTestResult = owasp.test(newPassword);
    if (!passTestResult.strong) {
      log(
        WARN,
        `Non-strong password entered for new password, user: ${user.email}`
      );
      // TODO: Convert to HTTP Exception
      throw new Error(
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
      log(
        WARN,
        `Passwords do not match for password reset, user: ${user.email}`
      );
      // TODO: Convert to HTTP Exception
      throw new Error("Passwords do not match");
    }
  }

  private validateToken(token: string, user: User) {
    const isCorrectToken = bcrypt.compareSync(token, user.resetToken);
    if (!isCorrectToken) {
      log(WARN, `User entered invalid token for password reset: ${user.email}`);
      // TODO: Convert to HTTP Exception
      throw new Error("Invalid token");
    }

    const timeDiff = moment(user.resetTokenExpires).diff(moment(), "second");
    if (timeDiff < 0) {
      log(WARN, `Token has expired for user: ${user.email}`);
      // TODO: Convert to HTTP Exception
      throw new Error("Expired token");
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
