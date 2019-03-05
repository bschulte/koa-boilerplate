import { ObjectType, Field } from "type-graphql";
import {
  Table,
  Default,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  BeforeCreate
} from "sequelize-typescript";
import { hashString } from "../../security/authentication";

@Table
@ObjectType({ description: "User model" })
export default class User extends Model<User> {
  @BeforeCreate
  private static hashPassword(instance: User) {
    instance.password = hashString(instance.password);
  }

  @Column
  public id: number;

  @Field()
  @Column
  public email: string;

  @Column
  public password: string;

  @Default(false)
  @Column
  public isAdmin: boolean;

  @Field()
  @CreatedAt
  public createdAt: Date;

  @Field()
  @UpdatedAt
  public updatedAt: Date;
}
