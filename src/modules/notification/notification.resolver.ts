import {
  Resolver,
  Query,
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Root
} from "type-graphql";

import { notificationService } from "./notification.service";
import { ADMIN } from "../../security/auth-checker";
import { authorizeResource } from "../../security/access-control";
import Notification from "./notification.entity";
import NotificationContent from "./notification-content.entity";

@Resolver(Notification)
export class NotificationResolver {
  @Query(() => Notification)
  @Authorized()
  public async notification(@Ctx() ctx: any, @Arg("uuid") uuid: string) {
    const notification = await notificationService.findOneByUuid(uuid);
    if (!notification) {
      throw new Error("Could not find notification");
    }

    authorizeResource(notification, ctx.user);

    return notification;
  }

  @FieldResolver(() => NotificationContent)
  public async content(@Root() notification: Notification) {
    return await notificationService.findContentById(notification.content.id);
  }
}
