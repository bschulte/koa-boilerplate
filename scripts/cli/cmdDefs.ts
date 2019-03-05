import { cliCreateUser } from "./user";

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

export const cmds = {
  user: {
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
      handler: (argv: any) => {
        cliCreateUser(argv);
      }
    }
  }
};
