import {
  Resolver,
  Query,
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Root,
  Mutation
} from "type-graphql";
import createError from "http-errors";
import { Service, Inject } from "typedi";

import { authorizeResource } from "../../security/access-control";
import Notification from "./notification.entity";
import NotificationContent from "./notification-content.entity";
import { StatusCode, roles } from "../../common/constants";
import { Logger } from "../../logging/Logger";
import { NotificationService } from "./notification.service";

@Service()
@Resolver(Notification)
export class NotificationResolver {
  private logger = new Logger(NotificationResolver.name);
  @Inject() private notificationService: NotificationService;

  @Query(() => [Notification])
  @Authorized()
  public async notifications(@Ctx() ctx: any) {
    this.logger.debug(`Getting all notifications for user: ${ctx.user.id}`);
    return await this.notificationService.findAll(ctx.user.id);
  }

  @Query(() => Notification)
  @Authorized()
  public async notification(@Ctx() ctx: any, @Arg("uuid") uuid: string) {
    const notification = await this.notificationService.findOneByUuid(uuid);
    if (!notification) {
      throw createError(StatusCode.BAD_REQUEST, "Could not find notification");
    }

    authorizeResource(notification, ctx.user);

    return notification;
  }

  @Mutation(() => [Notification])
  @Authorized([roles.ADMIN])
  public async createNotification(
    @Arg("userIds", () => [Number]) userIds: number[],
    @Arg("title") title: string,
    @Arg("html") html: string
  ) {
    return await this.notificationService.create(userIds, title, html);
  }

  @FieldResolver(() => NotificationContent)
  public async content(@Root() notification: Notification) {
    return await this.notificationService.findContentById(
      notification.contentId
    );
  }
}
