import dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";
dotenv.config();

const {
  NODE_ENV = "development",
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASS
} = process.env;

// Function to handle the setting up of anything that's needed
// before starting the server/running CLI commands
export const bootstrap = async () => {
  // Setup DB connection
  const sequelize = new Sequelize({
    dialect: "mysql",
    host: DB_HOST,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASS,
    modelPaths: [__dirname + "/**/*.model.ts"]
  });

  await sequelize.sync({
    alter: NODE_ENV === "development"
  });
};
