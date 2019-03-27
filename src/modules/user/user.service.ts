import { getRepository, Repository } from "typeorm";
import jwt from "jsonwebtoken";
import createError from "http-errors";

import User from "./user.entity";
import { randomStr } from "../../common/helpers/util";
import { hashString } from "../../security/authentication";
import UserAccess from "../user-access/user-access.entity";
import { comparePasswords } from "../../security/authentication";
import * as userAccessService from "../user-access/user-access.service";
import UserConfig from "../user-config/user-config.entity";
import * as userConfigService from "../user-config/user-config.service";
import { Logger } from "../../logging/Logger";
import { StatusCode } from "../../common/constants";

export const login = async (email: string, password: string) => {
  const user = await findOneByEmail(email);
  // Check if the user exists
  if (!user) {
    _logger.error(`Could not find user for email: ${email}`);
    throw createError(StatusCode.BAD_REQUEST, "Could not find user");
  }

  // Check if the password is correct
  if (!comparePasswords(password, user.password)) {
    _logger.error(`Invalid password entered for user: ${email}`);
    throw createError(StatusCode.BAD_REQUEST, "Invalid password");
  }

  return jwt.sign(
    { email, id: user.id },
    process.env.APP_KEY || "super secret",
    {
      expiresIn: "2d"
    }
  );
};

/**
 * Create a new user. Will return the generated password for the user
 *
 * @param email Email to use while creating new user
 */
export const create = async (email: string) => {
  const randomPassword = randomStr(12);

  const user = new User();
  user.email = email;
  user.password = randomPassword;

  // Create default access and config objects for the user during creation
  const access = new UserAccess();
  user.access = access;
  const config = new UserConfig();
  user.config = config;

  await save(user);

  return randomPassword;
};

export const changePassword = async (email: string, newPass: string) => {
  const hashedPass = hashString(newPass);
  await _repo().update({ email }, { password: hashedPass });
};

/**
 * Get a JWT corresponding to a given user for the admin user to impersonate
 *
 * @param email Email of user to get the impersonation token for
 */
export const getImpersonationToken = async (email: string) => {
  const user = await findOneByEmail(email);
  if (!user) {
    _logger.error(
      `User not found when requesting impersonation token: ${email}`
    );
    throw createError(StatusCode.BAD_REQUEST, "User not found");
  }

  return jwt.sign(
    { email, id: user.id },
    process.env.APP_KEY || "super secret",
    {
      expiresIn: "2d"
    }
  );
};

export const findOneById = async (userId: number) => {
  return await _repo().findOne(userId);
};

export const findOneByEmail = async (email: string) => {
  return await _repo().findOne({ email });
};

export const findAll = async () => {
  return await _repo().find();
};

export const remove = async (userId: number) => {
  const user = await findOneById(userId);

  // We have to delete the user itself first since if we tried to
  // delete the related entities, then we'd get an error since those
  // entities are referenced by the user
  await _repo().delete(userId);

  // We have to manually delete one-to-one relationships due
  // to how mysql delete cascades work
  await userAccessService.remove(user.accessId);
  await userConfigService.remove(user.configId);
};

export const save = async (user: User) => {
  await _repo().save(user);
};

const _repo = (): Repository<User> => {
  return getRepository(User);
};

const _logger = new Logger("UserService");
