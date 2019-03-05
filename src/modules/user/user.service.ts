import User from "./user.model";
import { UserInput } from "./dtos/UserInput";
import { randomStr } from "../../helpers/util";

class UserService {
  public async findOneById(userId: number): Promise<User> {
    return await User.findOne({ where: { id: userId } });
  }

  public async findOneByEmail(email: string): Promise<User> {
    return await User.findOne({ where: { email } });
  }

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
}

export const userService = new UserService();
