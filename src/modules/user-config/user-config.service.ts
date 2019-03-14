import UserConfig from "./user-config.entity";
import { getRepository, Repository } from "typeorm";
import createError from "http-errors";
import { StatusCode } from "../../common/constants";

export const findOneById = async (userConfigId: number) => {
  return await _repo().findOne(userConfigId);
};

export const update = async (userConfigId: number, key: string, value: any) => {
  const userConfig = await findOneById(userConfigId);
  if (!userConfig) {
    throw createError(
      StatusCode.BAD_REQUEST,
      "Could not find user config entry"
    );
  }

  if (!(key in userConfig)) {
    throw createError(
      StatusCode.BAD_REQUEST,
      `Invalid user config key: ${key}`
    );
  }

  userConfig[key] = value;
  await save(userConfig);

  return userConfig;
};

export const remove = async (userConfigId: number) => {
  await _repo().delete(userConfigId);
};

export const save = async (userConfig: UserConfig) => {
  return await _repo().save(userConfig);
};

const _repo = (): Repository<UserConfig> => {
  return getRepository(UserConfig);
};
