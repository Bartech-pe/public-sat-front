import { Inbox } from './inbox.model';
import { Office } from './office.model';
import { Role } from './role.model';
import { Skill } from './skill.model';

export interface User {
  id: number;
  name: string;
  displayName: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  roleId?: number;
  officeId?: number;
  role?: Role;
  office?: Office;
  verify?: boolean;
  connected?: boolean;
  estado?: string;
  celular?: string;
  status?: boolean;
  skills: Skill[];
  inboxes: Inbox[];
  vicidial?: VicidialUser;
}

export interface UserSender {
  id?: number;
  name: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  roleId: number;
  verified: boolean;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VicidialUser {
  id: number;
  username: string;
  userPass: string;
  phoneLogin: string;
  phonePass: string;
  userLevel: number;
  userGroup: string;
}
