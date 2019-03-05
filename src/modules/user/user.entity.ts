import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate
} from "typeorm";

import { hashString } from "../../security/authentication";
import UserAccess from "../userAccess/userAccess.entity";

@Entity()
@ObjectType({ description: "User model" })
export default class User {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Field()
  @Column()
  public email: string;

  @Column()
  public password: string;

  @Field()
  @CreateDateColumn()
  public createdAt: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt: Date;

  @OneToOne(() => UserAccess)
  @JoinColumn()
  public access: UserAccess;

  @BeforeInsert()
  @BeforeUpdate()
  private hashPassword() {
    this.password = hashString(this.password);
  }
}
