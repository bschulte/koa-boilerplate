import createTestClient from "../utils/mock-apollo";
import { GET_USER, GET_USERS } from "../utils/test-queries";
import { bootstrap } from "../../bootstrap-db";
import { getConnection } from "typeorm";

describe("user service e2e", () => {
  let testClient;

  beforeEach(async () => {
    await bootstrap();
    testClient = await createTestClient();
  });

  afterEach(async () => {
    await getConnection().close();
  });

  describe("user - query", () => {
    test("the user query should return the proper user data", async () => {
      const res = await testClient.query({ query: GET_USER });
      console.log(res);
      expect(res.data.user).toBeTruthy();
      expect(res.data.user.id).toBe(1);
      expect(res.data.user.email).toBe("test@test.com");
      expect(res.data.user.access.isAdmin).toBe(true);
      expect(res.data.user.config.configValueOne).toBe("awesome-value");
    });

    test("an admin user should be able to query all users", async () => {
      const res = await testClient.query({ query: GET_USERS });
      console.log(res);
      // expect(res.data.user).toMatchSnapshot();
    });
  });
});
