import { hashSync, compareSync } from "bcrypt";

export const hashString = (password: string): string => {
  return hashSync(password, 12);
};

export const comparePasswords = (
  passwordInput: string,
  userPassword: string
) => {
  return compareSync(passwordInput, userPassword);
};
