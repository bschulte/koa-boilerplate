import dotenv from "dotenv";
import { createConnection } from "typeorm";
import { SqlLogger } from "./logging/SqlLogger";
import { isDevEnv } from "./common/util";
dotenv.config();

const { DB_HOST, DB_NAME, DB_USER, DB_PASS } = process.env;

// Function to handle the setting up of anything that's needed
// before starting the server/running CLI commands
export const bootstrap = async () => {
  // Setup DB connection
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
};
