import User from "./user.model";
import { randomStr } from "../../helpers/util";
import { hashString } from "../../security/authentication";

class UserService {
  /**
   * Create a new user. Will return the generated password for the user
   *
   * @param email Email to use while creating new user
   */
  public async create(email: string) {
    const randomPassword = randomStr(12);
    await User.create({
      email,
      password: randomPassword
    });

    return randomPassword;
  }

  public async changePassword(
    email: string,
    newPass: string
  ): Promise<boolean> {
    const hashedPass = hashString(newPass);
    const [numUsersUpdated] = await User.update(
      { password: hashedPass },
      { where: { email } }
    );

    return numUsersUpdated === 1;
  }

  public async findOneById(userId: number): Promise<User> {
    return await User.findOne({ where: { id: userId } });
  }

  public async findOneByEmail(email: string): Promise<User> {
    return await User.findOne({ where: { email } });
  }
}

export const userService = new UserService();
