import { Role } from "../../enum/RoleEnum";
import { UserSex } from "../../enum/UserSexEnum";
import { UserStatus } from "../../enum/UserStatusEnum";

export type User = {
  id: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  img: string;
  sex: UserSex;
  info: string;
  otpCode: number;
  otpExpiresAt: string;
  banned: Boolean;
  activeStatus: UserStatus;
  roles: Role[];
  created: string;
  groupId: String;
};
