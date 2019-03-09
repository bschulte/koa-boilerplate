import User from "../modules/user/user.entity";
import createError from "http-errors";
import { StatusCode } from "../common/constants";
import { Logger } from "../logging/Logger";

const logger = new Logger("AccessControl");

// This will verify if the authenticated user has access to
// the given resource. This can be that the user directly
// owns the resource, or that the user is an admin
//
// Will throw an error on an unauthorized access
export const authorizeResource = (resource: any, user: User) => {
  if (!resource) {
    throw new Error(
      "Tried to verify invalid resource: " + JSON.stringify(resource)
    );
  }
  if (!("userId" in resource)) {
    throw new Error(
      "Attempting to verify resource that does not have a 'userId'" +
        JSON.stringify(resource)
    );
  }

  if (user.access.isAdmin) {
    return true;
  }

  if (user.id !== resource.userId) {
    throw createError(StatusCode.UNAUTHORIZED, "Unauthorized access");
  }

  return true;
};
