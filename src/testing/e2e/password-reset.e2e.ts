import { getConnection } from "typeorm";
import request from "supertest";
import { bootstrap, reloadMockData } from "../../bootstrap-db";
import app from "../../app";

describe("password-reset controller e2e", () => {
  beforeEach(async () => {
    await bootstrap();
    await reloadMockData();
  });

  afterEach(async () => {
    await getConnection().close();
  });

  test("creating a password reset request", async () => {
    const response = await request(app)
      .post("/password-reset")
      .send({
        email: "test@test.com"
      });
    console.log("Response:", response);
  });
});
