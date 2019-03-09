import { expect } from "chai";

import { authorizeResource } from "./access-control";
import { user } from "../modules/user/fixtures/user.fixture";

describe("access-control", () => {
  it("Throw when trying to authorize a non-existing resource", () => {
    expect(() => authorizeResource(null, user)).to.throw();
  });

  it("Throw when trying to authorize a resource that does not have a user id", () => {
    expect(() => authorizeResource({}, user)).to.throw();
  });

  it("Allow admins access to any resource", () => {
    user.access.isAdmin = true;
    expect(authorizeResource({ userId: 5 }, user)).to.equal(true);
    user.access.isAdmin = false;
  });

  it("Allow the proper user user access to their own resource", () => {
    user.id = 3;
    expect(authorizeResource({ userId: 3 }, user)).to.equal(true);
  });

  it("Throw error when invalid user tries to access resource", () => {
    user.id = 3;
    expect(() => authorizeResource({ userId: 5 }, user)).to.throw();
  });
});
