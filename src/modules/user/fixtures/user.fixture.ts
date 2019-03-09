import User from "../user.entity";

const _user = new User();

_user.id = 3;
_user.email = "test@test.com";
_user.password = "1234567";
_user.createdAt = new Date();
_user.updatedAt = new Date();
_user.resetToken = null;
_user.resetTokenExpires = null;
_user.access = {
  id: 1,
  isAdmin: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: null
};

export const user = _user;
