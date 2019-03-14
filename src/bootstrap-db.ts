import dotenv from "dotenv";
import {
  createConnection,
  getRepository,
  getConnection,
  EntityMetadata
} from "typeorm";

import { SqlLogger } from "./logging/SqlLogger";
import { isDevEnv } from "./common/helpers/util";
import User from "./modules/user/user.entity";
import UserAccess from "./modules/user-access/user-access.entity";
import UserConfig from "./modules/user-config/user-config.entity";
import Notification from "./modules/notification/notification.entity";
import NotificationContent from "./modules/notification/notification-content.entity";

dotenv.config();

const {
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASS,
  TEST_DB_HOST,
  TEST_DB_NAME,
  TEST_DB_USER,
  TEST_DB_PASS,
  NODE_ENV
} = process.env;

const _getEntities = async () => {
  const entities = [];
  (await (await getConnection()).entityMetadatas).forEach((x: EntityMetadata) =>
    entities.push({ name: x.name, tableName: x.tableName })
  );
  return entities;
};

const _cleanAll = async (entities: EntityMetadata[]) => {
  try {
    for (const entity of entities) {
      const repository = await getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE \`${entity.tableName}\`;`);
    }
  } catch (error) {
    throw new Error(`ERROR: Cleaning test db: ${error}`);
  }
};

const _createMockUserData = async () => {
  // User
  const access = new UserAccess();
  access.isAdmin = true;
  const config = new UserConfig();
  const user = new User();

  user.email = "test@test.com";
  user.password = "password";
  user.access = access;
  user.config = config;

  await getRepository(User).save(user);
};

const _createMockNotificationData = async () => {
  // Notification
  const notification = new Notification();
  const content = new NotificationContent();
  content.html = "<div>Test message</div>";
  content.title = "Test Title";
  notification.userId = 1;
  notification.content = content;

  await getRepository(Notification).save(notification);
};

export const reloadMockData = async () => {
  const entities = await _getEntities();
  // await _cleanAll(entities);

  await _createMockUserData();
  await _createMockNotificationData();
};

// Function to handle the setting up of anything that's needed
// before starting the server/running CLI commands
export const bootstrap = async () => {
  // Setup DB connection
  if (NODE_ENV !== "test") {
    await createConnection({
      type: "mysql",
      host: DB_HOST,
      database: DB_NAME,
      username: DB_USER,
      password: DB_PASS,
      entities: [__dirname + "/**/*.entity.ts"],
      logger: new SqlLogger(),
      synchronize: isDevEnv()
    });
  } else {
    await createConnection({
      type: "mysql",
      host: TEST_DB_HOST,
      database: TEST_DB_NAME,
      username: TEST_DB_USER,
      password: TEST_DB_PASS,
      entities: [__dirname + "/**/*.entity.ts"],
      synchronize: true,
      dropSchema: true
    });
  }
};
