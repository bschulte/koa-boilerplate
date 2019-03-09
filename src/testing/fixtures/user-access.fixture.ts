import UserAccess from "../../modules/user-access/user-access.entity";

const _userAccess = new UserAccess();
_userAccess.id = 1;
_userAccess.isAdmin = false;

export const userAccess = _userAccess;
