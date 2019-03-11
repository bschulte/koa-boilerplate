import * as userAccessService from "./user-access.service";
import { userAccess } from "../../testing/fixtures/user-access.fixture";

describe("user-access", () => {
  describe("update", () => {
    it("should throw an error when the user access entry could not be found", async () => {
      jest
        .spyOn(userAccessService, "findOneById")
        .mockImplementation(() => null);

      try {
        await userAccessService.update(1, "key", false);
      } catch (err) {
        expect(err.message).toBe("Could not find user access entry");
      }
    });

    it("should throw an error when the user access key attempting to be updated is not valid", async () => {
      jest
        .spyOn(userAccessService, "findOneById")
        .mockImplementation(async () => userAccess);

      try {
        await userAccessService.update(1, "badValue", false);
      } catch (err) {
        expect(err.message).toBe("Invalid user access key: badValue");
      }
    });
  });
});
