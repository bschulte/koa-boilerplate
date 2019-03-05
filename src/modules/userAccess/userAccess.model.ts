import { ObjectType, Field } from "type-graphql";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  Default,
  PrimaryKey,
  BelongsTo
} from "sequelize-typescript";
import User from "../user/user.model";

@Table
@ObjectType({ description: "UserAccess model" })
export default class UserAccess extends Model<UserAccess> {
  @PrimaryKey
  @Column
  public id: number;

  @Field()
  @Default(false)
  @Column
  public isAdmin: boolean;

  @Field()
  @CreatedAt
  public createdAt: Date;

  @Field()
  @UpdatedAt
  public updatedAt: Date;

  @BelongsTo(() => User, "userId")
  public user: User;
  @Column
  public userId: number;
}
