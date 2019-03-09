import User from "./user.entity";
import { randomStr } from "../../common/helpers/util";
import { hashString } from "../../security/authentication";
import UserAccess from "../user-access/user-access.entity";

import { getRepository, Repository } from "typeorm";
import * as userAccessService from "../user-access/user-access.service";
import UserConfig from "../user-config/user-config.entity";
import * as userConfigService from "../user-config/user-config.service";

const _repo = (): Repository<User> => {
  return getRepository(User);
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

  await _repo().save(user);

  return randomPassword;
};

export const changePassword = async (email: string, newPass: string) => {
  const hashedPass = hashString(newPass);
  await _repo().update({ email }, { password: hashedPass });
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
  await userAccessService.delete(user.accessId);
  await userConfigService.delete(user.configId);
};

export const save = async (user: User) => {
  await _repo().save(user);
};
