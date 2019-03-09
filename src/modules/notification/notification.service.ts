import { getRepository, Repository } from "typeorm";

import Notification from "./notification.entity";
import NotificationContent from "./notification-content.entity";

export const findAll = async (userId: number) => {
  return await _repo().find({ userId });
};

export const findOneByUuid = async (uuid: string) => {
  return await _repo().findOne({ uuid });
};

export const findContentById = async (id: number) => {
  return await _contentRepo().findOne(id);
};

const _repo = (): Repository<Notification> => {
  return getRepository(Notification);
};

const _contentRepo = (): Repository<NotificationContent> => {
  return getRepository(NotificationContent);
};
