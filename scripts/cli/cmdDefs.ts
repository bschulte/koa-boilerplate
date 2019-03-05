import { cliCreateUser, cliChangePass } from "./user";

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
  changePass: {
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
  }
};

export const cmds = {
  user: { ...userCmds }
};
