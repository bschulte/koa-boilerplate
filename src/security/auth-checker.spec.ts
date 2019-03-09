import { expect } from "chai";
import sinon from "sinon";

import { user } from "../testing/fixtures/user.fixture";
import { authChecker } from "./auth-checker";
import * as userService from "../modules/user/user.service";
import { mockModule } from "../testing/utils/mockModule";
import { roles } from "../common/constants";

describe("auth-checker", () => {
  let sandbox: sinon.SinonSandbox;
  let stub: sinon.SinonStub;
  let resolverData: any;

  let mockUserService;

  beforeEach(() => {
    stub = sinon.stub().returns(user);

    mockUserService = mockModule(userService, {
      findOneByEmail: stub
    });
    sandbox = sinon.createSandbox();

    resolverData = {
      context: { user: { email: "test@test.com" } },
      root: null,
      args: null,
      info: null
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("returns false when no user found in context", async () => {
    resolverData.context.user = null;
    expect(await authChecker(resolverData, [])).to.equal(false);
  });

  it("returns false when the user could not be found", async () => {
    mockUserService(sandbox);
    stub.returns(null);

    const result = await authChecker(resolverData, []);

    expect(result).to.equal(false);
    expect(stub.callCount).to.equal(1);
  });

  it("returns true when a user was found and no roles were required", async () => {
    mockUserService(sandbox);
    expect(await authChecker(resolverData, [])).to.equal(true);
  });

  it("returns true when its required that the user has admin access", async () => {
    user.access.isAdmin = true;
    mockUserService(sandbox);

    expect(await authChecker(resolverData, [roles.ADMIN])).to.equal(true);

    user.access.isAdmin = false;
  });

  it("returns false when the user does not meet any of the required roles", async () => {
    mockUserService(sandbox);
    expect(await authChecker(resolverData, [roles.ADMIN])).to.equal(false);
  });
});
