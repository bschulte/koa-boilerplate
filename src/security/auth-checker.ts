import { AuthChecker } from "type-graphql";
import * as userService from "../modules/user/user.service";
import { roles as userRoles } from "../common/constants";

export const authChecker: AuthChecker = async (
  { context }: { context: any },
  roles: string[]
) => {
  if (!context.user) {
    return false;
  }

  // While this requires an additional DB query for each query, it allows
  // use to have an up to date user configuration. This handles cases
  // where the JWT might have data about the user that is now outdated
  // such as a user being removed or their access level changing since last login
  const user = await userService.findOneByEmail(context.user.email);
  if (!user) {
    return false;
  }

  // The resource only requires that there is an authenticated user
  if (user && roles.length === 0) {
    return true;
  }

  // Go through each of the approved roles for the resource and
  // see if the user matches one of them
  for (const role of roles) {
    if (role === userRoles.ADMIN && user.access.isAdmin) {
      return true;
    }
  }

  return false;
};
