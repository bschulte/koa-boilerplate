jest.mock("../modules/user/user.service.ts");

import { user } from "../testing/fixtures/user.fixture";
import { authChecker } from "./auth-checker";
import * as userService from "../modules/user/user.service";
import { roles } from "../common/constants";

describe("auth-checker", () => {
  let resolverData: any;

  beforeEach(() => {
    resolverData = {
      context: { user: { email: "test@test.com" } },
      root: null,
      args: null,
      info: null
    };
    jest.mock("../modules/user/user.service.ts");
  });

  afterEach(() => {});

  it("returns false when no user found in context", async () => {
    resolverData.context.user = null;
    expect(await authChecker(resolverData, [])).toBe(false);
  });

  it("returns false when the user could not be found", async () => {
    const result = await authChecker(resolverData, []);

    expect(result).toBe(false);
  });

  it("returns true when a user was found and no roles were required", async () => {
    const spy = jest
      .spyOn(userService, "findOneByEmail")
      .mockImplementation(async () => user);

    expect(await authChecker(resolverData, [])).toBe(true);

    spy.mockRestore();
  });

  it("returns true when its required that the user has admin access", async () => {
    user.access.isAdmin = true;
    const spy = jest
      .spyOn(userService, "findOneByEmail")
      .mockImplementation(async () => user);

    expect(await authChecker(resolverData, [roles.ADMIN])).toBe(true);

    user.access.isAdmin = false;
    spy.mockRestore();
  });

  it("returns false when the user does not meet any of the required roles", async () => {
    const spy = jest
      .spyOn(userService, "findOneByEmail")
      .mockImplementation(async () => user);

    expect(await authChecker(resolverData, [roles.ADMIN])).toBe(false);

    spy.mockRestore();
  });
});
