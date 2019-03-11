import * as userConfigService from "./user-config.service";
import { userConfig } from "../../testing/fixtures/user-config.fixture";

describe("user-config", () => {
  describe("update", () => {
    it("should throw an error when the user config entry could not be found", async () => {
      jest
        .spyOn(userConfigService, "findOneById")
        .mockImplementation(() => null);

      try {
        await userConfigService.update(1, "key", "string");
      } catch (err) {
        expect(err.message).toBe("Could not find user config entry");
      }
    });

    it("should throw an error when the user access key attempting to be updated is not valid", async () => {
      jest
        .spyOn(userConfigService, "findOneById")
        .mockImplementation(async () => userConfig);

      try {
        await userConfigService.update(1, "badValue", 3);
      } catch (err) {
        expect(err.message).toBe("Invalid user config key: badValue");
      }
    });

    it("should properly update a user config field", async () => {
      const spy = jest
        .spyOn(userConfigService, "save")
        .mockImplementation(async () => ({
          ...userConfig,
          configValueOne: "testString"
        }));
      const newUserAccess = await userConfigService.update(
        1,
        "configValueOne",
        "testString"
      );

      expect(spy.mock.calls.length).toBe(1);
      expect(newUserAccess.configValueOne).toBe("testString");
    });
  });
});
