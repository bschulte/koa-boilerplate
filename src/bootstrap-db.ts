import dotenv from "dotenv";
import { existsSync, unlinkSync } from "fs";
import { createConnection, getRepository } from "typeorm";

import { SqlLogger } from "./logging/SqlLogger";
import { isDevEnv } from "./common/helpers/util";
import { Logger } from "./logging/Logger";
import User from "./modules/user/user.entity";
import UserAccess from "./modules/user-access/user-access.entity";
import UserConfig from "./modules/user-config/user-config.entity";

dotenv.config();

const { DB_HOST, DB_NAME, DB_USER, DB_PASS, NODE_ENV } = process.env;
const _logger = new Logger("Bootstrap");

const _createMockData = async () => {
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
    _logger.info("Bootstrapping test database");
    const DB_PATH = `${__dirname}/testing/testDb.sql`;

    // Start with a fresh database for testing
    if (existsSync(DB_PATH)) {
      unlinkSync(DB_PATH);
    }

    await createConnection({
      type: "sqlite",
      database: DB_PATH,
      synchronize: true,
      entities: [__dirname + "/**/*.entity.ts"],
      logger: new SqlLogger()
    });

    // Setup mock data for database
    await _createMockData();
  }
};
