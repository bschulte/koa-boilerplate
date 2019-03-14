import * as bcrypt from "bcrypt";
import { getConnection, getRepository } from "typeorm";
import request from "supertest";
import { bootstrap, reloadMockData } from "../../bootstrap-db";
import app from "../../app";
import User from "../../modules/user/user.entity";
import { Server } from "net";

describe("password-reset controller e2e", () => {
  let listeningApp: Server;

  beforeEach(async () => {
    await bootstrap();
    await reloadMockData();

    listeningApp = app.listen({ port: process.env.PORT });
  });

  afterEach(async () => {
    await getConnection().close();
    listeningApp.close();
  });

  test("creating a password reset request", async () => {
    const response = await request(listeningApp)
      .post("/password-reset")
      .send({
        email: "test@test.com"
      });
    expect(response.status === 200);
  });

  test("resetting a password properly via token", async () => {
    const resetToken = "1234";
    await getRepository(User).update(
      { id: 1 },
      { resetToken: bcrypt.hashSync(resetToken, 10) }
    );

    const response = await request(listeningApp)
      .patch("/password-reset")
      .send({
        token: resetToken,
        email: "test@test.com",
        newPassword: "newPassword1*",
        newPasswordDupe: "newPassword1*"
      });

    expect(response.status === 200);
  });
});
