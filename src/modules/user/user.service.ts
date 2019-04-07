import { getRepository, Repository } from "typeorm";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { Service, Inject } from "typedi";

import User from "./user.entity";
import { randomStr } from "../../common/helpers/util";
import { hashString } from "../../security/authentication";
import UserAccess from "../user-access/user-access.entity";
import { comparePasswords } from "../../security/authentication";
import UserConfig from "../user-config/user-config.entity";
import { Logger } from "../../logging/Logger";
import {
  StatusCode,
  EMAIL_FROM,
  VERIFY_EMAIL_SNIPPET
} from "../../common/constants";
import { OrmRepository } from "typeorm-typedi-extensions";
import { UserAccessService } from "../user-access/user-access.service";
import { UserConfigService } from "../user-config/user-config.service";
import { EmailerService } from "../emailer/emailer.service";

@Service()
export class UserService {
  private logger = new Logger(UserService.name);
  @OrmRepository(User) private repo: Repository<User>;

  @Inject() private userAccessService: UserAccessService;
  @Inject() private userConfigService: UserConfigService;
  @Inject() private emailerService: EmailerService;

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
  public async create(email: string, password: string = null) {
    // Make sure the user does not exist already
    const user = await this.findOneByEmail(email);
    if (user) {
      this.logger.debug(
        `Error while creating user, email exists already:${email}`
      );
      throw createError(StatusCode.BAD_REQUEST, "User exists already");
    }

    const randomPassword = randomStr(12);

    const newUser = new User();
    newUser.email = email;
    newUser.password = password || randomPassword;

    // Create default access and config objects for the user during creation
    const access = new UserAccess();
    newUser.access = access;
    const config = new UserConfig();
    newUser.config = config;

    // If the password was not provided, the user was created via the command
    // line or another internal admin service so we don't have to do
    // the email verification
    if (!password) {
      newUser.emailVerified = true;
    }

    await this.save(newUser);

    if (!newUser.emailVerified) {
      this.emailerService.send({
        subject: "Verify your email",
        to: [email],
        from: EMAIL_FROM,
        snippet: VERIFY_EMAIL_SNIPPET,
        params: {
          token: newUser.emailToken
        }
      });
    }

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
    await this.userAccessService.remove(user.accessId);
    await this.userConfigService.remove(user.configId);
  }

  public async save(user: User) {
    await this.repo.save(user);
  }
}
