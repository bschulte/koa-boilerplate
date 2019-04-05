import { getRepository, Repository } from "typeorm";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { Service } from "typedi";

import User from "./user.entity";
import { randomStr } from "../../common/helpers/util";
import { hashString } from "../../security/authentication";
import UserAccess from "../user-access/user-access.entity";
import { comparePasswords } from "../../security/authentication";
import * as userAccessService from "../user-access/user-access.service";
import UserConfig from "../user-config/user-config.entity";
import * as userConfigService from "../user-config/user-config.service";
import { Logger } from "../../logging/Logger";
import { StatusCode } from "../../common/constants";
import { OrmRepository } from "typeorm-typedi-extensions";

@Service()
export class UserService {
  private logger = new Logger(UserService.name);
  @OrmRepository(User) private repo: Repository<User>;

  public async login(email: string, password: string) {
    const user = await this.findOneByEmail(email);
    // Check if the user exists
    if (!user) {
      this.logger.error(`Could not find user for email: ${email}`);
      throw createError(StatusCode.BAD_REQUEST, "Could not find user");
    }

    // Check if the password is correct
    if (!comparePasswords(password, user.password)) {
      this.logger.error(`Invalid password entered for user: ${email}`);
      throw createError(StatusCode.BAD_REQUEST, "Invalid password");
    }

    return jwt.sign(
      { email, id: user.id },
      process.env.APP_KEY || "super secret",
      {
        expiresIn: "2d"
      }
    );
  }

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

    // Create default access and config objects for the user during creation
    const access = new UserAccess();
    user.access = access;
    const config = new UserConfig();
    user.config = config;

    await this.save(user);

    return randomPassword;
  }

  public async changePassword(email: string, newPass: string) {
    const hashedPass = hashString(newPass);
    await this.repo.update({ email }, { password: hashedPass });
  }

  /**
   * Get a JWT corresponding to a given user for the admin user to impersonate
   *
   * @param email Email of user to get the impersonation token for
   */
  public async getImpersonationToken(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      this.logger.error(
        `User not found when requesting impersonation token: ${email}`
      );
      throw createError(StatusCode.BAD_REQUEST, "User not found");
    }

    return jwt.sign(
      { email, id: user.id },
      process.env.APP_KEY || "super secret",
      {
        expiresIn: "2d"
      }
    );
  }

  public async findOneById(userId: number) {
    return await this.repo.findOne(userId);
  }

  public async findOneByEmail(email: string) {
    return await this.repo.findOne({ email });
  }

  public async findAll() {
    return await this.repo.find();
  }

  public async remove(userId: number) {
    const user = await this.findOneById(userId);

    // We have to delete the user itself first since if we tried to
    // delete the related entities, then we'd get an error since those
    // entities are referenced by the user
    await this.repo.delete(userId);

    // We have to manually delete one-to-one relationships due
    // to how mysql delete cascades work
    await userAccessService.remove(user.accessId);
    await userConfigService.remove(user.configId);
  }

  public async save(user: User) {
    await this.repo.save(user);
  }
}
