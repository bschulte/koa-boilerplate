import createTestClient from "../utils/mock-apollo";
import { GET_USER } from "../utils/test-queries";

describe("user service e2e", () => {
  let testClient;

  beforeAll(async () => {
    testClient = await createTestClient();
  });

  describe("user - query", () => {
    test("the user query should return the proper user data", async () => {
      const res = await testClient.query({ query: GET_USER });
      console.log(res);
    });
  });
});
