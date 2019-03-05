import { ObjectType, Field } from "type-graphql";
import User from "../user/user.entity";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity()
@ObjectType({ description: "UserAccess model" })
export default class UserAccess {
  @PrimaryGeneratedColumn()
  public readonly id: number;

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
  @Column()
  public userId: number;
}
