import User from "./user.entity";
import { randomStr } from "../../helpers/util";
import { hashString } from "../../security/authentication";
import UserAccess from "../userAccess/user-access.entity";

import { getRepository, Repository } from "typeorm";
import { userAccessService } from "../userAccess/user-access.service";

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

    await this.repo().save(user);

    return randomPassword;
  }

  public async changePassword(email: string, newPass: string): Promise<void> {
    const hashedPass = hashString(newPass);
    await this.repo().update({ email }, { password: hashedPass });
  }

  public async findOneById(userId: number): Promise<User> {
    return await this.repo().findOne(userId);
  }

  public async findOneByEmail(email: string): Promise<User> {
    return await this.repo().findOne({ email });
  }

  public async findAll(): Promise<User[]> {
    return await this.repo().find();
  }

  public async delete(userId: number) {
    const user = await this.findOneById(userId);

    // We have to delete the user itself first since if we tried to
    // delete the related entities, then we'd get an error since those
    // entities are referenced by the user
    await this.repo().delete(userId);

    // We have to manually delete one-to-one relationships due
    // to how mysql delete cascades work
    await userAccessService.delete(user.accessId);
  }

  private repo(): Repository<User> {
    return getRepository(User);
  }
}

export const userService = new UserService();
