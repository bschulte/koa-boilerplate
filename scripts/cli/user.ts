import chalk from "chalk";

import { getOptionValue } from "../cli";
import { userService } from "../../src/modules/user/user.service";

export const cliCreateUser = async (argv: any) => {
  const email = getOptionValue(argv, "e", "email");
  console.log("Creating user:", email);

  const generatedPassword = await userService.create(email);
  console.log("Generated password for user:", chalk.yellow(generatedPassword));
};
