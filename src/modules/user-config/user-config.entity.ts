import { ObjectType, Field, Authorized } from "type-graphql";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import { roles } from "../../common/constants";

@Entity()
@ObjectType({ description: "UserConfig entity" })
export default class UserConfig {
  @PrimaryGeneratedColumn()
  @Authorized(roles.ADMIN)
  @Field()
  public id: number;

  @Column({ default: "awesome-value" })
  @Field()
  public configValueOne: string;

  @Column({ default: 3 })
  @Field()
  public configValueTwo: number;

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;
}
