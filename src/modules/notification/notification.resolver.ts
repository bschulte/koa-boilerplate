import {
  Resolver,
  Query,
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Root
} from "type-graphql";
import createError from "http-errors";

import { notificationService } from "./notification.service";
import { authorizeResource } from "../../security/access-control";
import Notification from "./notification.entity";
import NotificationContent from "./notification-content.entity";
import { StatusCode } from "../../common/constants";

@Resolver(Notification)
export class NotificationResolver {
  @Query(() => [Notification])
  @Authorized()
  public async notifications(@Ctx() ctx: any) {
    return await notificationService.findAll(ctx.user.id);
  }

  @Query(() => Notification)
  @Authorized()
  public async notification(@Ctx() ctx: any, @Arg("uuid") uuid: string) {
    const notification = await notificationService.findOneByUuid(uuid);
    if (!notification) {
      createError(StatusCode.BAD_REQUEST, "Could not find notification");
    }

    authorizeResource(notification, ctx.user);

    return notification;
  }

  @FieldResolver(() => NotificationContent)
  public async content(@Root() notification: Notification) {
    return await notificationService.findContentById(notification.contentId);
  }
}
