import { User } from "./user.model";
import { UserInput } from "./dtos/UserInput";

class UserService {
  public async findOneById(userId: number): Promise<User> {
    return await User.findOne({ where: { id: userId } });
  }

  public async findOneByEmail(email: string): Promise<User> {
    return await User.findOne({ where: { email } });
  }

  public async create(newUserData: UserInput) {
    await User.create(newUserData);
  }
}

export const userService = new UserService();
