import { Inbox } from './inbox.model';
import { Oficina } from './oficina.model';
import { Role } from './role.model';
import { Skill } from './skill.model';

export interface User {
  id: number;
  name: string;
  displayName: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  idRole?: number;
  idOficina?: number;
  role?: Role;
  oficina?: Oficina;
  verify?: boolean;
  connected?: boolean;
  estado?: string;
  celular?: string;
  status?: boolean;
  skills: Skill[];
  inboxes: Inbox[];
  vicidial?: UserVicidial;
}

export interface UserSender {
  id?: number;
  name: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  idRole: number;
  verified: boolean;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserVicidial {
  id?: number;
  username: string;
  userPass: string;
  phoneLogin: string;
  phonePass: string;
  userLevel: number;
  userGroup: string;
}
