import { InputType, Field } from "type-graphql";
import { IsEmail } from "class-validator";

@InputType()
export class UserInput {
  @Field()
  @IsEmail()
  public email: string;

  @Field({ nullable: true })
  public password: string;
}
