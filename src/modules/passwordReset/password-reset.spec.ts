jest.mock("bcrypt", () => {
  return {
    compareSync: () => true,
    hashSync: (s: string) => s
  };
});
import moment from "moment";
import * as userService from "../user/user.service";
import * as passwordResetService from "./password-reset.service";

import { user } from "../../testing/fixtures/user.fixture";
import User from "../user/user.entity";

describe("password-reset", () => {
  let findOneByEmailSpy: jest.SpyInstance;
  let saveSpy: jest.SpyInstance;
  let testUser: User;

  beforeEach(() => {
    testUser = { ...user };
    findOneByEmailSpy = jest
      .spyOn(userService, "findOneByEmail")
      .mockImplementation(async () => testUser);
    saveSpy = jest.spyOn(userService, "save").mockReturnValue(null);
  });

  afterEach(() => {
    findOneByEmailSpy.mockRestore();
    saveSpy.mockRestore();
  });

  describe("createPasswordResetToken", () => {
    test("it properly creates a password reset token", async () => {
      expect(
        await passwordResetService.createPasswordResetToken(testUser.email)
      ).toBe(true);
    });

    test("it does not create a reset token for a non-existent user", async () => {
      findOneByEmailSpy.mockReturnValue(null);
      expect(
        await passwordResetService.createPasswordResetToken(testUser.email)
      ).toBe(false);
    });
  });

  describe("resetPassword", () => {
    test("it properly resets the user's password", async () => {
      expect(
        await passwordResetService.resetPassword(
          testUser.email,
          testUser.resetToken,
          "test-new-passA1234",
          "test-new-passA1234"
        )
      ).toBe(true);
    });

    test("it throws when given a bad token", async () => {
      try {
        await passwordResetService.resetPassword(
          testUser.email,
          "badToken",
          "test-new-passA1234",
          "test-new-passA1234"
        );
      } catch (err) {
        expect(err.message).toBe("Invalid token");
      }
    });

    test("it throws when given an expired token", async () => {
      testUser.resetTokenExpires = moment()
        .subtract(60, "days")
        .toDate();
      findOneByEmailSpy.mockReturnValue(testUser);

      try {
        await passwordResetService.resetPassword(
          testUser.email,
          testUser.resetToken,
          "test-new-passA1234",
          "test-new-passA1234"
        );
      } catch (err) {
        console.log("Error caught:", err);
        expect(err.message).toBe("Expired token");
      }
    });

    test("it throws when the new passwords do not match", async () => {
      try {
        await passwordResetService.resetPassword(
          testUser.email,
          testUser.resetToken,
          "test-new-passA1234",
          "different-password"
        );
      } catch (err) {
        expect(err.message).toBe("Passwords do not match");
      }
    });

    test("it throws when the new password does not meet security requirements", async () => {
      try {
        await passwordResetService.resetPassword(
          testUser.email,
          testUser.resetToken,
          "password",
          "password"
        );
      } catch (err) {
        expect(err.message).toMatch("Invalid new password, errors");
      }
    });
  });
});
