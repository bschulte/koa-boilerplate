import { Controller, Get } from "routing-controllers";
import { emailerService } from "../emailer/emailer.service";

@Controller()
export class UserController {
  @Get("/user")
  public async getAll() {
    return "This gets all users";
  }
}
