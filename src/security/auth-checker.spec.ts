import { expect } from "chai";
import sinon from "sinon";

import { user } from "../modules/user/fixtures/user.fixture";
import { authChecker } from "./auth-checker";
import * as userService from "../modules/user/user.service";
import { mockModule } from "../testing/utils/mockModule";

const resolverData = {
  context: { user: null },
  root: null,
  args: null,
  info: null
};

describe("auth-checker", () => {
  let sandbox: sinon.SinonSandbox;
  let stub: sinon.SinonStub;

  let mockUserService = mockModule(userService, {
    findOneByEmail: async () => user
  });

  beforeEach(() => {
    stub = sinon.stub();
    mockUserService = mockModule(userService, {
      findOneByEmail: stub
    });
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("returns false when no user found in context", async () => {
    expect(await authChecker(resolverData, [])).to.equal(false);
  });

  it("returns false when the user could not be found", async () => {
    mockUserService(sandbox);
    resolverData.context.user = { email: "test@test.com" };

    const result = await authChecker(resolverData, []);

    expect(result).to.equal(false);
    expect(stub.callCount).to.equal(1);
  });
});
