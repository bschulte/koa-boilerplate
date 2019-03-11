import UserConfig from "../../modules/user-config/user-config.entity";

const _userConfig = new UserConfig();
_userConfig.id = 2;
_userConfig.configValueOne = "string";
_userConfig.configValueTwo = 3;
_userConfig.createdAt = new Date();
_userConfig.updatedAt = new Date();

export const userConfig = _userConfig;
