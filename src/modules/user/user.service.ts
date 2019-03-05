import User from "./user.entity";
import { randomStr } from "../../helpers/util";
import { hashString } from "../../security/authentication";
import UserAccess from "../userAccess/userAccess.entity";
import { getRepository } from "typeorm";

class UserService {
  /**
   * Create a new user. Will return the generated password for the user
   *
   * @param email Email to use while creating new user
   */
  public async create(email: string) {
    const randomPassword = randomStr(12);

    const user = new User();
    user.email = email;
    user.password = randomPassword;

    const access = new UserAccess();
    user.access = access;

    await getRepository(User).save(user);

    return randomPassword;
  }

  public async changePassword(email: string, newPass: string): Promise<void> {
    const hashedPass = hashString(newPass);
    await getRepository(User).update({ email }, { password: hashedPass });
  }

  public async findOneById(userId: number): Promise<User> {
    return await getRepository(User).findOne(userId);
  }

  public async findOneByEmail(email: string): Promise<User> {
    return await getRepository(User).findOne({ email });
  }
}

export const userService = new UserService();
