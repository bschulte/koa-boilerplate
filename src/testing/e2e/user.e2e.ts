import createTestClient from "../utils/mock-apollo";
import { GET_USER, GET_USERS } from "../utils/test-queries";
import { bootstrap, reloadMockData } from "../../bootstrap-db";
import { getConnection } from "typeorm";
import {
  CREATE_USER,
  LOGIN,
  CHANGE_PASSWORD,
  DELETE_USER
} from "../test-mutations";
import * as userService from "../../modules/user/user.service";

describe("user resolver e2e", () => {
  let testClient;

  beforeEach(async () => {
    await bootstrap();
    await reloadMockData();
    testClient = await createTestClient();
  });

  afterEach(async () => {
    await getConnection().close();
  });

  test("the user query should return the proper user data", async () => {
    const res = await testClient.query({ query: GET_USER });
    expect(res.data.user).toBeTruthy();
    expect(res.data.user.id).toBe(1);
    expect(res.data.user.email).toBe("test@test.com");
    expect(res.data.user.access.isAdmin).toBe(true);
    expect(res.data.user.config.configValueOne).toBe("awesome-value");
  });

  test("an admin user should be able to query all users", async () => {
    const res = await testClient.query({ query: GET_USERS });
    expect(res.data.users).toBeTruthy();
    expect(res.data.users.length).toBe(1);
    expect(res.data.users[0].email).toBe("test@test.com");
  });

  test("an admin user should be able to create a user", async () => {
    const res = await testClient.mutate({
      mutation: CREATE_USER,
      variables: { newUserData: { email: "test123@test.com" } }
    });
    expect(res.data.createUser).toBeTruthy();
    expect(res.data.createUser.length).toBe(12);
  });

  test("should throw an error when trying to create a user that exists already", async () => {
    const res = await testClient.mutate({
      mutation: CREATE_USER,
      variables: { newUserData: { email: "test@test.com" } }
    });
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toBe("User exists already");
  });

  test("login works properly", async () => {
    const res = await testClient.mutate({
      mutation: LOGIN,
      variables: { userData: { email: "test@test.com", password: "password" } }
    });
    expect(res.data.login).toBeTruthy();
    expect(typeof res.data.login).toBe("string");
  });

  test("login with a non-existent email returns an error", async () => {
    const res = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        userData: { email: "test12345@test.com", password: "password" }
      }
    });
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toBe("Could not find user");
  });

  test("login with a bad password returns an error", async () => {
    const res = await testClient.mutate({
      mutation: LOGIN,
      variables: {
        userData: { email: "test@test.com", password: "badPass" }
      }
    });
    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toBe("Invalid password");
  });

  test("that an admin can change a user's password", async () => {
    const res = await testClient.mutate({
      mutation: CHANGE_PASSWORD,
      variables: {
        email: "test@test.com",
        newPass: "newPass"
      }
    });
    expect(res.data.changePassword).toBe(true);
  });

  test("that an admin can delete a user", async () => {
    const user = await userService.findOneByEmail("test@test.com");
    const res = await testClient.mutate({
      mutation: DELETE_USER,
      variables: {
        userId: user.id
      }
    });
    expect(res.data.deleteUser).toBe(true);
  });
});
