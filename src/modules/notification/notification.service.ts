import { getRepository, Repository } from "typeorm";

import Notification from "./notification.entity";
import NotificationContent from "./notification-content.entity";

class NotificationService {
  public async findAll(userId: number) {
    return await this.repo().find({ userId });
  }

  public async findOneByUuid(uuid: string): Promise<Notification> {
    return await this.repo().findOne({ uuid });
  }

  public async findContentById(id: number): Promise<NotificationContent> {
    return await this.contentRepo().findOne(id);
  }

  private repo(): Repository<Notification> {
    return getRepository(Notification);
  }

  private contentRepo(): Repository<NotificationContent> {
    return getRepository(NotificationContent);
  }
}

export const notificationService = new NotificationService();
