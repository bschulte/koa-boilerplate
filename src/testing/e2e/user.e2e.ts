import createTestClient from "../utils/mock-apollo";
import { GET_USER } from "../utils/test-queries";

describe("user service e2e", async () => {
  const { query, mutate } = await createTestClient();

  describe("user - query", () => {
    test.only("the user query should return the proper user data", async () => {
      const res = await query({ query: GET_USER });
      console.log(res);
    });
  });
});
