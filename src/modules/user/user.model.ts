import { ObjectType, Field } from "type-graphql";
import {
  Table,
  Default,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  BeforeCreate,
  PrimaryKey,
  HasOne
} from "sequelize-typescript";
import { hashString } from "../../security/authentication";
import UserAccess from "../userAccess/userAccess.model";

@Table
@ObjectType({ description: "User model" })
export default class User extends Model<User> {
  @BeforeCreate
  private static hashPassword(instance: User) {
    instance.password = hashString(instance.password);
  }

  @PrimaryKey
  @Column
  public id: number;

  @Field()
  @Column
  public email: string;

  @Column
  public password: string;

  @Field()
  @CreatedAt
  public createdAt: Date;

  @Field()
  @UpdatedAt
  public updatedAt: Date;

  @HasOne(() => UserAccess, "userId")
  public access: UserAccess;
}
