import { cliCreateUser, cliChangePass, cliDeleteUser } from "./user.cli";
import { cliBootstrap } from "./bootstrap-module.cli";

export const FINAL_CMD = "finalCmd";

export interface IOption {
  name: string;
  alias?: string;
  required?: boolean;
  type: string; // JS type that the argument should be
  handler: (argv: any) => void;
  description?: string;
  flag?: boolean; // Signifies if the option is simply a binary flag
}

const bootstrapCmds = {
  module: {
    type: FINAL_CMD,
    handler: cliBootstrap
  }
};

const userCmds = {
  create: {
    type: FINAL_CMD,
    options: [
      {
        name: "e",
        alias: "email",
        required: true,
        description: "Email to use for user creation",
        type: "string"
      }
    ],
    handler: cliCreateUser
  },
  "change-pass": {
    type: FINAL_CMD,
    options: [
      {
        name: "e",
        alias: "email",
        required: true,
        description: "Email of the user to change the password",
        type: "string"
      },
      {
        name: "p",
        alias: "password",
        required: true,
        description: "New password to switch to",
        type: "string"
      }
    ],
    handler: cliChangePass
  },
  delete: {
    type: FINAL_CMD,
    options: [
      {
        name: "e",
        alias: "email",
        description: "Email of user to delete",
        type: "string"
      }
    ],
    handler: cliDeleteUser
  }
};

/**
 * This is the main definition of commands that can be run. It is a nested object
 * where the final sub-commands are marked with a property indicating that that
 * one is the actual command to be run. From there, options and a handler function
 * are provided to dictate what data is expected and what function to run for
 * the command.
 */
export const cmds = {
  user: { ...userCmds },
  bootstrap: { ...bootstrapCmds }
};
