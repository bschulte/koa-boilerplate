import { authorizeResource } from "./access-control";
import { user } from "../modules/user/fixtures/user.fixture";

describe("access-control", () => {
  test("Throw when trying to authorize a non-existing resource", () => {
    expect(() => authorizeResource(null, user)).toThrow();
  });

  test("Throw when trying to authorize a resource that does not have a user id", () => {
    expect(() => authorizeResource({}, user)).toThrow();
  });

  test("Allow admins access to any resource", () => {
    user.access.isAdmin = true;
    expect(authorizeResource({ userId: 5 }, user)).toEqual(true);
    user.access.isAdmin = false;
  });

  test("Allow the proper user user access to their own resource", () => {
    user.id = 3;
    expect(authorizeResource({ userId: 3 }, user)).toEqual(true);
  });

  test("Throw error when invalid user tries to access resource", () => {
    user.id = 3;
    expect(() => authorizeResource({ userId: 5 }, user)).toThrow();
  });
});
