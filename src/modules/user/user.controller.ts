import { Controller, Get } from "routing-controllers";

@Controller()
export class UserController {
  @Get("/user")
  public getAll() {
    return "This gets all users";
  }
}
