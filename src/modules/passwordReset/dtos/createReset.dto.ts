import { IsEmail } from "class-validator";

export class CreateResetDto {
  @IsEmail()
  public email: string;
}
