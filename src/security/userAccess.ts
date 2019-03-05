import User from "../modules/user/user.model";

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

  if (user.isAdmin) {
    return true;
  }

  if (user.id !== resource.userId) {
    throw new Error("Unauthorized access");
  }
};
