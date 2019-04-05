import { getRepository, Repository } from "typeorm";

import Notification from "./notification.entity";
import NotificationContent from "./notification-content.entity";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";

@Service()
export class NotificationService {
  @OrmRepository(Notification) private repo: Repository<Notification>;

  @OrmRepository(NotificationContent) private contentRepo: Repository<
    NotificationContent
  >;

  public async findAll(userId: number) {
    return await this.repo.find({ userId });
  }

  public async findOneByUuid(uuid: string) {
    return await this.repo.findOne({ uuid });
  }

  public async findContentById(id: number) {
    return await this.contentRepo.findOne(id);
  }

  public async create(userIds: number[], title: string, html: string) {
    const notifications = userIds.map((id: number) => {
      return this.repo.create({
        userId: id,
        content: this.contentRepo.create({
          title,
          html
        })
      });
    });

    return await this.repo.save(notifications);
  }
}
