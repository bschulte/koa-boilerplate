import { ObjectType, Field } from "type-graphql";
import {
  Table,
  Default,
  Column,
  CreatedAt,
  UpdatedAt,
  Model
} from "sequelize-typescript";

@Table
@ObjectType({ description: "User model" })
export default class User extends Model<User> {
  @Field()
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
