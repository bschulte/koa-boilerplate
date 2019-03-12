import UserAccess from "./user-access.entity";
import { getRepository, Repository } from "typeorm";
import createError from "http-errors";
import { StatusCode } from "../../common/constants";

export const findOneById = async (userAccessId: number) => {
  return await _repo().findOne(userAccessId);
};

export const remove = async (userAccessId: number) => {
  return await _repo().delete(userAccessId);
};

export const update = async (
  userAccessId: number,
  key: string,
  value: boolean
) => {
  const userAccess = await findOneById(userAccessId);
  if (!userAccess) {
    throw createError(
      StatusCode.BAD_REQUEST,
      "Could not find user access entry"
    );
  }

  if (!(key in userAccess)) {
    throw createError(
      StatusCode.BAD_REQUEST,
      `Invalid user access key: ${key}`
    );
  }

  userAccess[key] = value;
  await save(userAccess);

  return userAccess;
};

export const save = async (userAccess: UserAccess) => {
  return await _repo().save(userAccess);
};

const _repo = (): Repository<UserAccess> => {
  return getRepository(UserAccess);
};
