import inquirer from "inquirer";
import { getConnectionOptions, createConnection } from "typeorm";
import { User } from "../entities";

(async () => {
  // Setup DB connection
  const options = await getConnectionOptions();
  const conn = await createConnection({
    ...options,
    entities: [`${__dirname}/../entities/*.entity.ts`],
    synchronize: false,
    logging: false
  });
  const repo = conn.getRepository(User);

  const { email, password }: any = await inquirer.prompt([
    { type: "input", name: "email", message: "Email:" },
    { type: "password", name: "password", message: "Password:" }
  ]);

  const newUser = repo.create({
    email,
    password
  });
  await repo.save(newUser);

  process.exit(0);
})();
