import { getConnection } from "typeorm";
import createTestClient from "../utils/mock-apollo";
import { bootstrap, reloadMockData } from "../../bootstrap-db";
import { UPDATE_USER_CONFIG } from "../utils/test-mutations";

describe("user-config resolver e2e", () => {
  let testClient;

  beforeEach(async () => {
    await bootstrap();
    await reloadMockData();
    testClient = await createTestClient();
  });

  afterEach(async () => {
    await getConnection().close();
  });

  test("updating a user config value", async () => {
    const res = await testClient.mutate({
      mutation: UPDATE_USER_CONFIG,
      variables: {
        userConfigId: 1,
        key: "configValueOne",
        value: "anotherValue"
      }
    });

    expect(res.data.updateUserConfig).toBeTruthy();
    expect(res.data.updateUserConfig.configValueOne).toBe("anotherValue");
  });
});
