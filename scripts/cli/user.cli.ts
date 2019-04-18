import chalk from "chalk";
import prompts from "prompts";
import { Container } from "typedi";

import { getOptionValue } from "../cli";
import User from "../../src/modules/user/user.entity";
import { UserService } from "../../src/modules/user/user.service";

const userService = Container.get(UserService);

export const cliCreateUser = async (argv: any) => {
  const email = getOptionValue(argv, "e", "email");
  console.log("Creating user:", email);

  const generatedPassword = await userService.create(email);
  console.log("Generated password for user:", chalk.yellow(generatedPassword));
};

export const cliChangePass = async (argv: any) => {
  const email = getOptionValue(argv, "e", "email");
  const password = getOptionValue(argv, "p", "password");

  await userService.changePassword(email, password);
  console.log(chalk.green("Successfully changed password"));
};

export const cliDeleteUser = async (argv: any) => {
  let email = getOptionValue(argv, "e", "email");

  // If we weren't provided an email, issue a prompt to the user to select which
  // user they want to delete
  if (!email) {
    const users = await userService.findAll();
    const response = await prompts({
      type: "select",
      name: "email",
      message: "Select a user to delete",
      choices: users.map((user: User) => ({
        title: user.email,
        value: user.email
      }))
    });
    email = response.email;
  }

  const user = await userService.findOneByEmail(email);

  const response = await prompts({
    type: "toggle",
    name: "confirmed",
    message: `Are you sure you want to delete user ${email}?`,
    initial: false,
    active: "Yes",
    inactive: "No"
  });

  if (!response.confirmed) {
    console.log("Operation aborted");
    process.exit(0);
  }

  await userService.remove(user.id);
};
