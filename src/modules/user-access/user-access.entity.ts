import { ObjectType, Field, Authorized } from "type-graphql";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne
} from "typeorm";
import User from "../user/user.entity";
import { roles } from "../../common/constants";

@Entity()
@ObjectType({ description: "UserAccess model" })
export default class UserAccess {
  @PrimaryGeneratedColumn()
  @Authorized(roles.ADMIN)
  @Field()
  public id: number;

  @Field()
  @Column({ default: false })
  public isAdmin: boolean;

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => User)
  public user: User;
}
