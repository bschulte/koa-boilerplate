import { IsEmail, IsString } from "class-validator";

export class ResetDto {
  @IsEmail()
  public email: string;
  @IsString()
  public newPassword: string;
  @IsString()
  public newPasswordDupe: string;
  @IsString()
  public token: string;
}
