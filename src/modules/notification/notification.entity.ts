import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Generated,
  ManyToOne
} from "typeorm";
import NotificationContent from "./notification-content.entity";

@Entity()
@ObjectType({ description: "Notification entity" })
export default class Notification {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public userId: number;

  @Field()
  @Column()
  public status: "read" | "unread" | "deleted";

  @Field()
  @Generated("uuid")
  @Column()
  public uuid: string;

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToOne(
    () => NotificationContent,
    (notificationContent: NotificationContent) =>
      notificationContent.notifications,
    { cascade: true }
  )
  public content: NotificationContent;
  @Column()
  public contentId: number;
}
