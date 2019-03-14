import { getConnection, getRepository } from "typeorm";
import createTestClient from "../utils/mock-apollo";
import { GET_NOTIFICATIONS, GET_NOTIFICATION } from "../utils/test-queries";
import { bootstrap, reloadMockData } from "../../bootstrap-db";
import Notification from "../../modules/notification/notification.entity";

describe("notification resolver e2e", () => {
  let testClient;

  beforeEach(async () => {
    await bootstrap();
    await reloadMockData();
    testClient = await createTestClient();
  });

  afterEach(async () => {
    await getConnection().close();
  });

  test("getting all notifications for the user", async () => {
    const res = await testClient.query({
      query: GET_NOTIFICATIONS
    });
    expect(res.data.notifications).toBeTruthy();
    expect(res.data.notifications.length).toBe(1);
    expect(res.data.notifications[0].content.title).toBe("Test Title");
  });

  test("getting a single notification by UUID", async () => {
    const notification = await getRepository(Notification).findOne({
      relations: ["content"]
    });

    const res = await testClient.query({
      query: GET_NOTIFICATION,
      variables: { uuid: notification.uuid }
    });

    expect(res.data.notification.uuid).toEqual(notification.uuid);
    expect(res.data.notification.content.title).toEqual(
      notification.content.title
    );
  });

  test("trying to get a notification with a UUID that does not exist", async () => {
    const res = await testClient.query({
      query: GET_NOTIFICATION,
      variables: { uuid: "bad-uuid-value" }
    });

    expect(res.errors.length).toBe(1);
    expect(res.errors[0].message).toBe("Could not find notification");
  });
});
