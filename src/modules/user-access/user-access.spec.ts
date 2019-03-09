import sinon from "sinon";
import { expect } from "chai";

import { mockModule } from "../../testing/utils/mockModule";
import * as userAccessService from "./user-access.service";
import { userAccess } from "../../testing/fixtures/user-access.fixture";

describe("user-access", () => {
  let sandbox: sinon.SinonSandbox;
  const mockUserService = mockModule(userAccessService, {
    findOneById: async () => userAccess
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("update", () => {
    it("should throw an error when the user access entry could not be found", async () => {
      mockUserService(sandbox, {
        findOneById: () => null
      });

      expect(() => userAccessService.update(1, "key", false)).to.throw();
    });
  });
});
