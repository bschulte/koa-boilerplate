import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany
} from "typeorm";
import Notification from "./notification.entity";

@Entity()
@ObjectType({ description: "Notification entity" })
export default class NotificationContent {
  @PrimaryGeneratedColumn()
  public id: number;

  @Field()
  @Column()
  public title: string;

  @Field()
  @Column()
  public html: string;

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToMany(
    () => Notification,
    (notificationStatus: Notification) => notificationStatus.content
  )
  public notifications: Notification[];
}
